import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { Chat } from './components/Chat';
import { PokerTable } from './components/PokerTable';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './pages/AuthForm';
import { Alert } from './components/Alert';
import { ActionPanel } from './components/ActionPanel';
import { Profile } from './components/Profile';
import { LogOut, Wallet, User, History, Volume2, VolumeX } from 'lucide-react';
import { getCallAmount, isPlayerTurn } from './utils/pokerLogic';
import { useSound } from './hooks/useSound';

function App() {
  const { socket, tableData, joinTable, leaveTable, sendAction, sendEmoji } = useSocket();
  const { isMuted, toggleMute } = useSound();
  
  const [user, setUser] = useState<{token: string, name: string, id: string, avatar_url?: string} | null>(() => {
    const savedUser = localStorage.getItem('poker_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(() => {
    const pathTableId = window.location.pathname.startsWith('/table/') ? window.location.pathname.split('/')[2] : null;
    return localStorage.getItem('active_table') !== null || pathTableId !== null;
  });
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(() => {
    const pathTableId = window.location.pathname.startsWith('/table/') ? window.location.pathname.split('/')[2] : null;
    return pathTableId || localStorage.getItem('active_table') || '';
  });
  const [minBuyIn, setMinBuyIn] = useState(() => Number(localStorage.getItem('min_buy_in')) || 1000);
  const [buyIn, setBuyIn] = useState(() => localStorage.getItem('last_buy_in') || '1000');
  const [solde, setSolde] = useState<number | null>(null);
  const [isFetchingSolde, setIsFetchingSolde] = useState(false);
  const [showRecave, setShowRecave] = useState(false);
  const [isProcessingRecave, setIsProcessingRecave] = useState(false);
  const [scale, setScale] = useState(1);
  const [alertConfig, setAlertConfig] = useState<{message: string, type: 'error'|'success'|'info'} | null>(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedTable) {
        socket?.emit('leaveTable', { tableId: selectedTable });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [socket, selectedTable]);

  // Re-fetch solde when tableData is received for the first time after a refresh
  useEffect(() => {
    if (tableData && user) {
      fetchSolde();
    }
  }, [tableData?.id, user?.id]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchSolde = useCallback(() => {
    if (!user?.token || isFetchingSolde) return;
    setIsFetchingSolde(true);
    fetch(`${API_URL}/api/solde`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          localStorage.removeItem('poker_user');
          setUser(null);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.montant !== undefined) {
          const m = parseFloat(data.montant);
          setSolde(isNaN(m) ? 0 : m);
        }
      })
      .catch(err => console.error('Error fetching solde:', err))
      .finally(() => setIsFetchingSolde(false));
  }, [user?.token, API_URL]);

  const fetchProfile = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }
    } catch (err) {
      console.error("Erreur chargement profil", err);
    }
  }, [user?.token, API_URL]);

  useEffect(() => {
    if (user && !user.avatar_url) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (user) fetchSolde();
  }, [user, fetchSolde]);

  const getAvatarUrl = (avatar_url?: string, name?: string) => {
    if (avatar_url) {
      return avatar_url.startsWith('http') ? avatar_url : `${API_URL}${avatar_url}`;
    }
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${name || 'default'}`;
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const targetWidth = width < 480 ? 540 : 1000; 
      const scaleW = (width * 0.9) / targetWidth;
      setScale(Math.min(1.0, scaleW));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const myPlayer = tableData?.players.find((p: any) => p.name === user?.name);
  const isMyTurn = isPlayerTurn(tableData, socket?.id);
  const callAmount = getCallAmount(tableData, myPlayer);

  useEffect(() => {
    if (myPlayer && myPlayer.chips > 0 && isProcessingRecave) {
      setIsProcessingRecave(false);
      setShowRecave(false);
    }
  }, [myPlayer?.chips, isProcessingRecave]);

  useEffect(() => {
    // Vérifier si tableData est chargé (pas nul)
    if (isReadyToPlay && tableData && myPlayer) {
      // Attendre que le solde soit chargé avant de décider d'afficher la recave
      if (solde !== null && !isFetchingSolde) {
        if (myPlayer.chips <= 0 && tableData.gameState === 'waiting') {
           if (solde <= 0) {
              // Nouveau : Si stack à 0 ET solde à 0, on quitte la table automatiquement
              setAlertConfig({ message: "Solde insuffisant pour recaver. Veuillez recharger votre compte.", type: 'info' });
              leaveTable();
              setIsReadyToPlay(false);
              setShowRecave(false);
              localStorage.removeItem('active_table');
              window.history.pushState({}, '', '/dashboard');
           } else if (!showRecave && !isProcessingRecave) {
              setShowRecave(true);
           }
        }
      }
    }
  }, [tableData, myPlayer, isReadyToPlay, showRecave, isProcessingRecave, solde, isFetchingSolde, leaveTable]);

  const [gameStartTime, setGameStartTime] = useState<number | null>(() => {
    if (!user?.id) return null;
    const saved = localStorage.getItem(`game_start_time_${user.id}`);
    return saved ? parseInt(saved) : null;
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExitPopup, setShowExitPopup] = useState(false);

  useEffect(() => {
    // Le compteur ne s'active que s'il y a au moins 2 joueurs
    const hasEnoughPlayers = tableData && tableData.players && tableData.players.length >= 2;

    if (isReadyToPlay && hasEnoughPlayers && !gameStartTime && user?.id) {
      const now = Date.now();
      setGameStartTime(now);
      localStorage.setItem(`game_start_time_${user.id}`, now.toString());
    }
  }, [isReadyToPlay, gameStartTime, user?.id, tableData]);

  useEffect(() => {
    if (!gameStartTime) return;
    const interval = setInterval(() => {
      // Vérifier toujours le nombre de joueurs en temps réel
      const hasEnoughPlayers = tableData && tableData.players && tableData.players.length >= 2;
      
      if (hasEnoughPlayers) {
        const elapsed = Date.now() - gameStartTime;
        const remaining = 45 * 60 * 1000 - elapsed;
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }
      // Si moins de 2 joueurs, on ne décrémente pas, le temps reste figé
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStartTime, tableData]);

  const rejoinTable = () => {
    joinTable(user!.name, selectedTable, "0");
    setIsReadyToPlay(true);
    setShowRecave(false);
    window.history.pushState({}, '', `/table/${selectedTable}`);
  };

  const handleJoinDirectly = (tableId: string, buyInAmount: number) => {
    if (isProcessingRecave) return;
    
    // Vérification de solde simplifiée pour la cave
    if (solde !== null && buyInAmount > solde) {
      setAlertConfig({ message: "Votre solde est insuffisant", type: 'error' });
      return;
    }

    joinTable(user!.name, tableId, String(buyInAmount)); 
    setIsReadyToPlay(true);
    
    const now = Date.now();
    setGameStartTime(now);
    localStorage.setItem(`game_start_time_${user!.id}`, now.toString());
    
    setShowJoinForm(false);
    localStorage.setItem('active_table', tableId);
    localStorage.setItem('last_buy_in', String(buyInAmount));
    window.history.pushState({}, '', `/table/${tableId}`);
  };

  const handleJoin = () => {
    if (isProcessingRecave) return;
    
    // Si on est en mode recave, on utilise le 'buyIn' courant, 
    // sinon c'est la reconnexion ou la cave initiale.
    const amount = parseInt(buyIn);
    const effectiveMinBuyIn = tableData?.minBuyIn || minBuyIn;
    
    if (isNaN(amount)) {
      setAlertConfig({ message: "Montant invalide", type: 'error' });
      return;
    }
    
    // Vérification uniquement si on ajoute des jetons (pas pour une simple reconnexion à 0)
    if (amount > 0) {
        if (amount < effectiveMinBuyIn) {
          setAlertConfig({ 
            message: `Vous ne pouvez pas rejoindre avec moins de ${effectiveMinBuyIn.toLocaleString()} MGA (Cave minimale)`, 
            type: 'error' 
          });
          return;
        }
        if (solde !== null && amount > solde) {
          setAlertConfig({ message: "Votre solde est insuffisant pour cette cave", type: 'error' });
          return;
        }
    }

    if (showRecave) {
      setIsProcessingRecave(true);
    }
    
    joinTable(user!.name, selectedTable, String(amount)); 
    setIsReadyToPlay(true);
    
    const now = Date.now();
    setGameStartTime(now);
    localStorage.setItem(`game_start_time_${user!.id}`, now.toString());
    
    setShowJoinForm(false);
    setShowRecave(false);
    localStorage.setItem('active_table', selectedTable);
    localStorage.setItem('last_buy_in', String(amount));
    localStorage.setItem('min_buy_in', String(effectiveMinBuyIn));
    
    window.history.pushState({}, '', `/table/${selectedTable}`);
  };

  useEffect(() => {
    // Initial path handle
    if (user && window.location.pathname === '/') {
      window.history.replaceState({}, '', '/dashboard');
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
         if (user) window.history.replaceState({}, '', '/dashboard');
      } else if (path === '/dashboard') {
         if (!user) {
           window.history.replaceState({}, '', '/');
         } else {
           setIsReadyToPlay(false);
         }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  if (!user) return <AuthForm onSuccess={(token, name, id) => {
    localStorage.clear(); // Nettoyage total pour éviter les conflits
    localStorage.setItem('poker_user', JSON.stringify({ token, name, id }));
    setUser({ token, name, id });
    // connectSocket(token); // Si cette fonction existe, elle doit être appelée après
    window.location.reload();
  }} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {alertConfig && <Alert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig(null)} />}
      
      {showProfile && user && (
        <Profile 
          currentUser={{ token: user.token, name: user.name, id: user.id }} 
          onClose={() => setShowProfile(false)}
          onProfileUpdate={(updatedUser) => {
            setUser(prev => prev ? { ...prev, ...updatedUser } : null);
          }}
        />
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-yellow-500 italic uppercase tracking-tighter flex items-center gap-2">
                <History className="w-6 h-6" /> Historique des mains
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
                <LogOut className="w-6 h-6 rotate-180" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                Aucun historique disponible pour le moment
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showRecave && (
        <div className="h-screen bg-black/95 flex items-center justify-center p-4 z-[2000] fixed inset-0 backdrop-blur-md">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border-2 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-sm w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
               <Wallet className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Plus de Jetons !</h2>
              <p className="text-gray-500 text-xs font-bold uppercase mt-1">Voulez-vous recaver pour continuer ?</p>
            </div>
            <div className="w-full space-y-4">
              <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Votre Solde Principal</div>
                 <div className="text-yellow-500 font-black text-xl">{solde?.toLocaleString()} MGA</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Montant de la Recave</label>
                  <span className="text-[10px] font-black text-red-400 uppercase">Min: {minBuyIn.toLocaleString()}</span>
                </div>
                <input 
                  type="number" value={buyIn || ''} onChange={(e) => setBuyIn(e.target.value)} 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-black text-center text-2xl focus:border-yellow-500 outline-none" 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[minBuyIn, minBuyIn * 5, minBuyIn * 10].map(val => (
                   <button key={val} onClick={() => setBuyIn(String(val))} className="py-2 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-yellow-500/20 transition-all">{val.toLocaleString()}</button>
                 ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
               <button onClick={handleJoin} className="w-full py-4 bg-yellow-500 text-black font-black uppercase rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">Recaver Maintenant</button>
               <button onClick={() => { 
                  leaveTable(); 
                  setIsReadyToPlay(false); 
                  setShowRecave(false);
                  localStorage.removeItem('active_table');
                  window.history.pushState({}, '', '/');
               }} className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">Quitter la Table</button>
            </div>
          </div>
        </div>
      )}

      {showJoinForm ? (
        <div className="h-screen bg-black/90 flex items-center justify-center p-4 z-[1000] fixed inset-0">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-yellow-500/30 shadow-2xl max-w-sm w-full flex flex-col items-center gap-6">
            <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">Entrer Cave</h2>
            <div className="w-full space-y-4">
              <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Votre Solde</div>
                 <div className="text-white font-black text-xl">{solde?.toLocaleString()} MGA</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Montant initial</label>
                  <span className="text-[10px] font-black text-yellow-500 uppercase text-xs">Min: {minBuyIn.toLocaleString()}</span>
                </div>
                <input 
                  type="number" value={buyIn || ''} onChange={(e) => setBuyIn(e.target.value)} 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-black text-center text-2xl focus:border-yellow-500 outline-none" 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[minBuyIn, minBuyIn * 5, minBuyIn * 10].map(val => (
                   <button key={val} onClick={() => setBuyIn(String(val))} className="py-2 bg-white/10 rounded-lg text-xs font-bold text-white hover:bg-yellow-500/20 transition-all">{val.toLocaleString()}</button>
                 ))}
              </div>
            </div>
            <div className="flex gap-3 w-full">
               <button onClick={() => setShowJoinForm(false)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Annuler</button>
               <button onClick={handleJoin} className="flex-1 py-4 bg-yellow-500 text-black font-black uppercase rounded-2xl hover:bg-yellow-400 transition-all">Jouer</button>
            </div>
          </div>
        </div>
      ) : !isReadyToPlay ? (
        <Dashboard 
          user={user} 
          solde={solde}
          onRefreshSolde={fetchSolde}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onJoinTable={(id, amount) => {
            if (amount === 0) {
                // Reconnexion directe : on appelle joinTable sans ouvrir le modal
                joinTable(user!.name, String(id), "0");
                setIsReadyToPlay(true);
                localStorage.setItem('active_table', String(id));
                window.history.pushState({}, '', `/table/${id}`);
            } else {
                // Nouvelle cave : on ouvre le modal
                setSelectedTable(String(id)); 
                setMinBuyIn(amount); 
                setBuyIn(String(amount)); 
                fetchSolde();
                setShowJoinForm(true); 
            }
          }} 
          onLogout={() => {
            localStorage.removeItem('poker_user');
            setUser(null);
          }} 
          onOpenProfile={() => setShowProfile(true)}
        />
      ) : (
        <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
          {/* HEADER: 4% */}
          <div className="h-[4%] w-full flex justify-between items-center px-4 z-50 bg-black/20 border-b border-white/5 shrink-0">
             <button 
                onClick={() => {
                  if (isFetchingSolde) return; 
                  const hasEnoughPlayers = tableData && tableData.players && tableData.players.length >= 2;
                  if (!hasEnoughPlayers || timeRemaining <= 0) {
                      leaveTable();
                      setIsReadyToPlay(false);
                      localStorage.removeItem('active_table');
                      localStorage.removeItem('game_start_time');
                      window.history.pushState({}, '', '/');
                  }
                }} 
                className={`h-[70%] px-2 bg-black/40 rounded-lg text-[9px] font-black uppercase border border-white/10 flex items-center gap-1 transition-all shrink-0 
                  ${(isFetchingSolde || (tableData && tableData.players.length >= 2 && timeRemaining > 0)) ? 'text-gray-500 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-white'}`}
             >
               <LogOut className="w-3 h-3" /> 
               {(tableData && tableData.players.length >= 2 && timeRemaining > 0) ? `${Math.floor(timeRemaining / 60000)}:${Math.floor((timeRemaining % 60000) / 1000).toString().padStart(2, '0')}` : 'Quitter'}
             </button>
             
             <div className="flex items-center gap-2 h-full">
                <div className="flex items-center gap-1">
                   <button onClick={() => setShowHistory(true)} className="p-1 text-gray-400 hover:text-white transition-all"><History className="w-3.5 h-3.5" /></button>
                   <button onClick={toggleMute} className="p-1 text-gray-400 hover:text-white transition-all">
                     {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-green-500" />}
                   </button>
                </div>
                <div className="flex items-center gap-2 bg-black/40 h-[80%] px-2 rounded-full border border-white/5">
                   <span className="text-white font-black text-[9px] uppercase tracking-tighter">{user.name}</span>
                   <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                      <Wallet className="w-2.5 h-2.5 text-yellow-500" />
                      <div className="text-[10px] font-black text-yellow-500">{(myPlayer?.chips || 0).toLocaleString()}</div>
                   </div>
                </div>
             </div>
          </div>

          {/* TABLE AREA: 86% */}
          <div className="h-[86%] w-full flex items-center justify-center overflow-hidden relative">
            <PokerTable tableData={tableData} currentUserId={socket?.id} currentUserName={user?.name} isVertical={true} sendAction={sendAction} sendEmoji={sendEmoji} callAmount={callAmount} isMyTurn={isMyTurn} />
            <div className="absolute bottom-4 right-4 z-[3000]">
                <Chat tableId={tableData?.id || 'lobby'} playerName={user.name} socket={socket} />
            </div>
          </div>
          
          {/* ACTION PANEL: 10% */}
          <div className="h-[10%] w-full flex items-center justify-center bg-gradient-to-t from-black to-transparent px-2 shrink-0">
            <div className="w-full max-w-[420px]">
               <ActionPanel sendAction={sendAction} callAmount={callAmount} isMyTurn={isMyTurn} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;