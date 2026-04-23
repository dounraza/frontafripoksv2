import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { Chat } from './components/Chat';
import { PokerTable } from './components/PokerTable';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './pages/AuthForm';
import { Alert } from './components/Alert';
import { LogOut, ArrowUpCircle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { getCallAmount, getMinRaiseTo, getMaxRaiseTo, isPlayerTurn } from './utils/pokerLogic';

function App() {
  const { socket, tableData, error, joinTable, leaveTable, sendAction } = useSocket();
  const [user, setUser] = useState<{token: string, name: string} | null>(() => {
    const savedUser = localStorage.getItem('poker_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isReadyToPlay, setIsReadyToPlay] = useState(() => {
    const pathTableId = window.location.pathname.startsWith('/table/') ? window.location.pathname.split('/')[2] : null;
    return localStorage.getItem('active_table') !== null || pathTableId !== null;
  });
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState(() => {
    const pathTableId = window.location.pathname.startsWith('/table/') ? window.location.pathname.split('/')[2] : null;
    return pathTableId || localStorage.getItem('active_table') || '';
  });
  const [buyIn, setBuyIn] = useState(() => {
    return localStorage.getItem('last_buy_in') || '1000';
  });

  // Gestion du routage factice pour l'URL
  useEffect(() => {
    if (!user) {
      window.history.pushState({}, '', '/');
    } else if (isReadyToPlay && selectedTable) {
      window.history.pushState({}, '', `/table/${selectedTable}`);
    } else {
      window.history.pushState({}, '', '/dashboard');
    }
  }, [user, isReadyToPlay, selectedTable]);

  // Reconnexion automatique à la table au chargement si les données existent
  useEffect(() => {
    if (user && isReadyToPlay && selectedTable && socket) {
      // Un petit délai pour laisser le socket se connecter
      const timer = setTimeout(() => {
        joinTable(user.name, selectedTable, buyIn);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [socket, user]); // On ne dépend pas de isReadyToPlay pour éviter de re-joindre en boucle

  const [minBuyIn, setMinBuyIn] = useState(0);
  const [solde, setSolde] = useState<number | null>(null);
  const [raiseAmount, setRaiseAmount] = useState(100);
  const [isVertical, setIsVertical] = useState(window.innerWidth < 768);
  const [scale, setScale] = useState(1);
  const [alertConfig, setAlertConfig] = useState<{message: string, type: 'error'|'success'|'info'} | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isVert = width < 768;
      setIsVertical(isVert);
      
      if (isVert) {
        const targetWidth = 520;
        const targetHeight = 950; // Augmenté pour que la table ait plus de place
        const scaleW = width / targetWidth;
        // Augmenter le ratio de hauteur pour rendre la table plus grande sur mobile
        const scaleH = (height * 0.75) / targetHeight;
        setScale(Math.min(1.1, scaleW, scaleH));      } else {
        const targetWidth = 1200;
        const targetHeight = 850;
        const scaleW = (width - 40) / targetWidth;
        const scaleH = (height - 160) / targetHeight;
        setScale(Math.min(1, scaleW, scaleH));
      }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
      }, []);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('poker_user', JSON.stringify(user));
      fetchSolde();
    } else {
      localStorage.removeItem('poker_user');
    }
  }, [user]);

  const fetchSolde = () => {
    if (!user) return;
    fetch(`${API_URL}/api/solde`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setSolde(data.montant))
      .catch(err => console.error('Error fetching solde:', err));
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(buyIn);
    if (isNaN(amount) || amount <= 0) {
      setAlertConfig({ message: "Montant invalide", type: 'error' });
      return;
    }
    if (solde !== null && amount > solde) {
      setAlertConfig({ message: `Solde insuffisant (${solde} MGA)`, type: 'error' });
      return;
    }
    if (user) {
      joinTable(user.name, selectedTable, buyIn); 
      setIsReadyToPlay(true);
      setShowJoinForm(false);
      localStorage.setItem('active_table', selectedTable);
      localStorage.setItem('last_buy_in', buyIn);
      setTimeout(fetchSolde, 1000);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsReadyToPlay(false);
    localStorage.removeItem('active_table');
    localStorage.removeItem('last_buy_in');
    localStorage.removeItem('poker_user');
  };

  // Logic separated into utilities
  const myPlayer = tableData?.players.find((p: any) => p.name === user?.name);
  const isMyTurn = isPlayerTurn(tableData, socket?.id);
  const callAmount = getCallAmount(tableData, myPlayer);
  const minRaiseTo = Number(getMinRaiseTo(tableData)) || 20;
  const maxRaiseTo = Number(getMaxRaiseTo(myPlayer)) || 0;

  // Synchronisation du raiseAmount au début du tour ou changement de mise min
  useEffect(() => {
    if (isMyTurn && !isNaN(minRaiseTo) && !isNaN(maxRaiseTo)) {
      setRaiseAmount(current => {
        const safeCurrent = Number(current) || minRaiseTo;
        if (safeCurrent < minRaiseTo) return minRaiseTo;
        if (safeCurrent > maxRaiseTo) return maxRaiseTo;
        return safeCurrent;
      });
    }
  }, [isMyTurn, minRaiseTo, maxRaiseTo]);

  useEffect(() => {
    if (myPlayer && myPlayer.chips === 0 && tableData?.gameState === 'waiting' && !showRechargeModal && isReadyToPlay) {
      setShowRechargeModal(true);
    }
  }, [myPlayer?.chips, tableData?.gameState, isReadyToPlay]);

  if (!user) {
    return <AuthForm onSuccess={(token, name) => setUser({ token, name })} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {alertConfig && <Alert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig(null)} />}
      
      {showRechargeModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-yellow-500/50 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <h3 className="text-xl font-black text-white uppercase italic">Plus de jetons !</h3>
            <p className="text-gray-400 text-sm">Votre cave est vide.</p>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <button onClick={() => { leaveTable(); setIsReadyToPlay(false); setShowRechargeModal(false); localStorage.removeItem('active_table'); }} className="py-3 bg-white/5 text-gray-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10">Quitter</button>
              <button onClick={() => { setShowRechargeModal(false); setShowJoinForm(true); setBuyIn(String(minBuyIn)); }} className="py-3 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-yellow-400">Recharger</button>
            </div>
          </div>
        </div>
      )}

      {showJoinForm ? (
        <div className="min-h-screen bg-gradient-to-br from-[#1c1c1c] to-[#0a2e1a] flex items-center justify-center p-4">
          <form onSubmit={handleJoin} className="bg-gradient-to-br from-gray-900/90 to-black/90 p-10 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col items-center gap-6 shadow-3xl max-w-sm w-full animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-yellow-500 italic text-center uppercase tracking-tighter">Rejoindre la table</h2>
            <div className="w-full space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Votre Solde</div>
                <div className="text-white font-black text-xl">{solde?.toLocaleString()} MGA</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 text-center block">Montant de votre cave</label>
                <input 
                  type="number" 
                  value={buyIn}
                  onChange={(e) => setBuyIn(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-center text-2xl focus:outline-none focus:border-yellow-500 transition-all shadow-inner"
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button type="button" onClick={() => setShowJoinForm(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl font-black uppercase tracking-widest transition-all">Annuler</button>
              <button type="submit" className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">Jouer</button>
            </div>
          </form>
        </div>
      ) : !isReadyToPlay ? (
        <Dashboard user={user} onJoinTable={(id, min) => { setSelectedTable(String(id)); setMinBuyIn(min); setBuyIn(String(min)); setShowJoinForm(true); }} onLogout={handleLogout} />
      ) : (
        <div className="flex flex-col items-center p-4">
          <div className="w-full max-w-[1400px] flex justify-between items-center mb-4 px-4">
             <div className="flex gap-2">
                <button onClick={() => { leaveTable(); setIsReadyToPlay(false); localStorage.removeItem('active_table'); localStorage.removeItem('last_buy_in'); }} className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 border border-white/5"><LogOut className="w-4 h-4" /> Quitter</button>
             </div>
             {/* <button onClick={() => setIsVertical(!isVertical)} className="hidden sm:px-4 sm:py-2 sm:bg-white/5 sm:hover:bg-yellow-500/20 sm:text-gray-400 sm:hover:text-yellow-500 sm:rounded-xl sm:text-xs sm:font-black sm:uppercase sm:transition-all sm:border sm:border-white/5 sm:block">Orientation</button> */}
             <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[9px] font-black text-gray-500 uppercase">Votre Cave</div>
                  <div className="text-sm font-black text-yellow-500">{(myPlayer?.chips || 0).toLocaleString()} MGA</div>
                </div>
                <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.name}`} className="w-10 h-10 rounded-full border-2 border-yellow-500" alt="avatar" />
             </div>
          </div>

          <div 
            className={`w-full flex flex-col items-center ${isVertical ? 'justify-start pt-10' : 'justify-center flex-1'}`}
          >
            <div 
              className="transition-all duration-700 origin-top flex justify-center"
              style={{ 
                transform: `scale(${scale})`,
                height: isVertical ? `${890 * scale}px` : 'auto' // Légère augmentation de la hauteur de réserve
              }} 
            >
              <PokerTable tableData={tableData} currentUserId={socket?.id} currentUserName={user?.name} isVertical={isVertical} />
            </div>
          </div>

          <div className="fixed bottom-4 left-4 z-[50]">
             <Chat tableId={tableData?.id || 'lobby'} playerName={user.name} socket={socket} />
          </div>

          {/* Action buttons section - Placé immédiatement sous la table sur mobile */}
          <div className={`w-full max-w-4xl transition-all duration-500 flex justify-center pb-safe ${isVertical ? 'mt-[-20px] relative z-[60]' : 'mt-24 sm:mt-32'}`}>
            {isVertical ? (
              <div className={`flex flex-col items-center gap-2 transition-all duration-700 w-full ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="grid grid-cols-3 gap-2 w-full max-w-[400px] px-4">
                  <button onClick={() => sendAction('fold')} className="flex flex-col items-center justify-center p-3 bg-red-950/30 border border-red-500/40 rounded-2xl active:scale-95 transition-all shadow-lg">
                    <span className="text-[11px] font-black uppercase text-red-500 tracking-tighter">FOLD</span>
                  </button>
                  <button onClick={() => sendAction(callAmount > 0 ? 'call' : 'check')} className="flex flex-col items-center justify-center p-3 bg-green-950/30 border border-green-500/40 rounded-2xl active:scale-95 transition-all shadow-lg">
                    <span className="text-[11px] font-black uppercase text-green-500 tracking-tighter">{callAmount > 0 ? 'CALL' : 'CHECK'}</span>
                  </button>
                  <button onClick={() => sendAction('all-in')} className="flex flex-col items-center justify-center p-3 bg-yellow-950/30 border border-yellow-500/40 rounded-2xl active:scale-95 transition-all shadow-lg">
                    <span className="text-[11px] font-black uppercase text-yellow-500 tracking-tighter">ALL-IN</span>
                  </button>
                  <div className="col-span-3 flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full mt-1">
                    <input 
                      type="number" 
                      value={raiseAmount} 
                      onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)} 
                      className="bg-black/40 text-white font-black w-20 py-2 rounded-xl focus:outline-none text-center text-sm border border-white/5" 
                    />
                    <button 
                      onClick={() => sendAction('raise', raiseAmount)} 
                      className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black flex-1 py-2.5 rounded-xl font-black uppercase text-[11px] shadow-xl"
                    >
                      Raise
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-8 transition-all ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <button onClick={() => sendAction('fold')} className="px-8 py-3 bg-red-600 rounded-xl font-black uppercase italic hover:bg-red-500 transition-all">Fold</button>
                <button onClick={() => sendAction(callAmount > 0 ? 'call' : 'check')} className="px-8 py-3 bg-green-600 rounded-xl font-black uppercase italic hover:bg-green-500 transition-all">{callAmount > 0 ? `Call ${callAmount}` : 'Check'}</button>
                <button onClick={() => sendAction('all-in')} className="px-8 py-3 bg-yellow-600 rounded-xl font-black uppercase italic hover:bg-yellow-500 transition-all">All-in</button>
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                  <input 
                    type="number" 
                    value={raiseAmount} 
                    onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)} 
                    className="w-24 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-white font-black text-center" 
                  />
                  <button 
                    onClick={() => sendAction('raise', raiseAmount)} 
                    className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-black uppercase hover:bg-yellow-400 transition-all"
                  >
                    Raise
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
