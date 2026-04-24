import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { Chat } from './components/Chat';
import { PokerTable } from './components/PokerTable';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './pages/AuthForm';
import { Alert } from './components/Alert';
import { ActionPanel } from './components/ActionPanel';
import { LogOut, Wallet } from 'lucide-react';
import { getCallAmount, isPlayerTurn } from './utils/pokerLogic';

function App() {
  const { socket, tableData, joinTable, leaveTable, sendAction } = useSocket();
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
  const [buyIn, setBuyIn] = useState(() => localStorage.getItem('last_buy_in') || '1000');
  const [solde, setSolde] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [alertConfig, setAlertConfig] = useState<{message: string, type: 'error'|'success'|'info'} | null>(null);

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

  const handleJoin = () => {
    const amount = parseInt(buyIn);
    if (isNaN(amount) || amount <= 0) {
      setAlertConfig({ message: "Montant invalide", type: 'error' });
      return;
    }
    joinTable(user!.name, selectedTable, buyIn); 
    setIsReadyToPlay(true);
    setShowJoinForm(false);
    localStorage.setItem('active_table', selectedTable);
    localStorage.setItem('last_buy_in', buyIn);
    // Update URL
    window.history.pushState({}, '', `/table/${selectedTable}`);
  };

  if (!user) return <AuthForm onSuccess={(token, name) => setUser({ token, name })} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {alertConfig && <Alert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig(null)} />}
      
      {showJoinForm ? (
        <div className="min-h-screen bg-black/90 flex items-center justify-center p-4 z-[1000] fixed inset-0">
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-yellow-500/30 shadow-2xl max-w-sm w-full flex flex-col items-center gap-6">
            <h2 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">Entrer Cave</h2>
            
            <div className="w-full space-y-4">
              <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Votre Solde</div>
                 <div className="text-white font-black text-xl">{solde?.toLocaleString()} MGA</div>
              </div>
              
              <input 
                type="number" value={buyIn} onChange={(e) => setBuyIn(e.target.value)} 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-black text-center text-2xl focus:border-yellow-500 outline-none" 
              />

              <div className="grid grid-cols-3 gap-2">
                 {[1000, 5000, 10000].map(val => (
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
        <Dashboard user={user} onJoinTable={(id, min) => { setSelectedTable(String(id)); setBuyIn(String(min)); setShowJoinForm(true); }} onLogout={() => setUser(null)} />
      ) : (
        <div className="flex flex-col items-center min-h-screen pb-10">
          <div className="w-full max-w-[1400px] flex justify-between items-center py-4 px-6 z-50">
             <button onClick={() => { 
                leaveTable(); 
                setIsReadyToPlay(false); 
                localStorage.removeItem('active_table');
                window.history.pushState({}, '', '/');
             }} className="px-4 py-2 bg-black/40 text-gray-400 rounded-xl text-[10px] font-black uppercase border border-white/10 flex items-center gap-2 hover:text-white transition-all"><LogOut className="w-4 h-4" /> Quitter</button>
             
             <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex flex-col items-end mr-1">
                   <div className="text-white font-black text-[11px] uppercase italic tracking-tighter">{user.name}</div>
                   <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-yellow-500" />
                      <div className="text-sm font-black text-yellow-500">{(myPlayer?.chips || 0).toLocaleString()} <span className="text-[10px]">MGA</span></div>
                   </div>
                </div>
                <div className="relative w-10 h-10 rounded-full border-2 border-yellow-500 p-0.5 overflow-hidden shadow-lg shadow-yellow-500/10">
                   <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.name}`} alt="avatar" className="rounded-full w-full h-full" />
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center w-full max-w-[1400px]">
            <div className="transition-all duration-700 origin-top flex justify-center" style={{ transform: `scale(${scale})` }}>
              <PokerTable tableData={tableData} currentUserId={socket?.id} currentUserName={user?.name} isVertical={true} sendAction={sendAction} callAmount={callAmount} isMyTurn={isMyTurn} />
            </div>

            {/* ACTION PANEL TOKANA */}
            <div className="w-full flex justify-center mt-6 px-4">
               <ActionPanel sendAction={sendAction} callAmount={callAmount} isMyTurn={isMyTurn} />
            </div>

            <div className="w-full max-w-[420px] px-2 mt-4">
               <Chat tableId={tableData?.id || 'lobby'} playerName={user.name} socket={socket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
