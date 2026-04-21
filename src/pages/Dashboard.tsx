import React, { useState, useEffect } from 'react';
import { Zap, Wallet, Home, DollarSign, Trophy, User, Target, Play, Dices, ChevronDown, History as HistoryIcon, Eye, EyeOff, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { Chat } from '../components/Chat';

interface DashboardProps {
  onJoinTable: (tableId: string | number, minBuyIn: number) => void;
  user: { name: string; token: string };
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onJoinTable, user, onLogout }) => {
  const [onlineCount, setOnlineCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('onlineCount', (count: number) => {
        setOnlineCount(count);
      });
      socket.on('lobbyUpdate', (updateData: { id: number | string, currentPlayers: number, playerNames?: string[] }[]) => {
        console.log("Mise à jour lobby reçue:", updateData);
        setTables(prevTables => {
          return prevTables.map(table => {
            const update = updateData.find(u => String(u.id) === String(table.id));
            if (update) {
              return { 
                ...table, 
                currentPlayers: update.currentPlayers,
                playerNames: update.playerNames || [] 
              };
            }
            return table;
          });
        });
      });
      return () => {
        socket.off('onlineCount');
        socket.off('lobbyUpdate');
      };
    }
  }, [socket]);

  const [view, setView] = useState<'main' | 'cashGames' | 'tournaments'>('main');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSolde, setShowSolde] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const [solde, setSolde] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawMobileName, setWithdrawMobileName] = useState('');
  const [pseudo, setPseudo] = useState(user.name);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileMoneyName, setMobileMoneyName] = useState('');
  const [reference, setReference] = useState('');
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<'All' | 'holdem' | 'omaha'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 6;

  const slides = [
    { title: 'COIN REWARDS', desc: 'Gagnez des jetons en jouant', img: '/image/4.jpg' },
    { title: 'BONUS WEEKEND', desc: 'Jusqu\'à 200% de bonus', img: '/image/Poker_hero.png' },
    { title: 'TOURNOI MENSUEL', desc: 'jouer pour gagner', img: '/image/poker.jpg' },
    { title: 'DAILY JACKPOT', desc: 'Tentez votre chance chaque jour', img: '/image/re.jfif' }
  ];

  const tableImages = ['/image/4.jpg', '/image/Poker_hero.png', '/image/poker.jpg', '/image/re.jfif'];

  const getTableImage = (id: number) => {
    const index = id % tableImages.length;
    return tableImages[index] || '/logo.ico';
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchSolde = () => {
    fetch(`${API_URL}/api/solde`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => setSolde(data.montant))
      .catch(err => console.error('Error fetching solde:', err));
  };

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  useEffect(() => {
    fetchSolde();

    if (view === 'cashGames') {
      fetch(`${API_URL}/api/tables`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => setTables(data))
        .catch(err => console.error('Error fetching tables:', err));
    }
  }, [view, user.token]);

  const handleDeposit = () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || !phoneNumber || !reference) return;

    fetch(`${API_URL}/api/solde/deposit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` 
      },
      body: JSON.stringify({ 
        pseudo: pseudo,
        montant: parseFloat(depositAmount),
        numero: phoneNumber,
        nom: mobileMoneyName,
        reference: reference
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(`Erreur: ${data.error}`);
        } else {
          setShowDepositModal(false);
          setDepositAmount('');
          setPhoneNumber('');
          setMobileMoneyName('');
          setReference('');
          alert("Votre demande de dépôt a été enregistrée.");
        }
      })
      .catch(err => console.error('Error depositing:', err));
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || !withdrawPhone) return;
    if (solde !== null && parseFloat(withdrawAmount) > solde) {
      alert("Solde insuffisant pour ce retrait");
      return;
    }

    fetch(`${API_URL}/api/solde/withdraw`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` 
      },
      body: JSON.stringify({ 
        pseudo: pseudo,
        montant: parseFloat(withdrawAmount),
        numero: withdrawPhone,
        nom: withdrawMobileName
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(`Erreur: ${data.error}`);
        } else {
          setSolde(data.montant);
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          setWithdrawPhone('');
          setWithdrawMobileName('');
          alert("Votre demande de retrait a été enregistrée.");
        }
      })
      .catch(err => console.error('Error withdrawing:', err));
  };

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (gameFilter === 'All' || t.gameType.toLowerCase() === gameFilter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-black/40"> {/* Réduit px-6 à px-4 */}
              <div className="flex items-center gap-4 sm:gap-8"> {/* Logo and Poker text */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <img src="/logo.ico" alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
                    <div className="text-white font-black text-xl sm:text-2xl tracking-tighter italic">AFRI<span className="text-yellow-500">POKS</span></div>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 text-sm font-bold text-gray-400"> {/* Main navigation links */}
                  <span onClick={() => setView('main')} className={`${view === 'main' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-400'} py-5 cursor-pointer flex items-center gap-2 text-xs sm:text-sm`}>{/* <Trophy className="w-4 h-4" /> */}<span className="hidden xs:inline">POKER</span></span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-4"> {/* Réduit le gap de 3 à 1 pour mobile, et sm:gap-6 à sm:gap-4 */}
                <div className="text-[10px] font-bold text-gray-500 hidden md:flex items-center gap-1">● {onlineCount} Joueurs</div>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30 relative">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  <span className="text-[11px] sm:text-sm font-bold text-yellow-500 cursor-pointer" onClick={() => { setShowWalletMenu(!showWalletMenu); setShowProfileMenu(false); }}>
                    {solde !== null ? (showSolde ? `${Number(solde).toLocaleString('fr-FR')} MGA` : '•••• MGA') : '...'}
                  </span>
                  <button onClick={() => setShowSolde(!showSolde)} className="ml-0.5 sm:ml-1 text-yellow-500/70 hover:text-yellow-500">
                    {showSolde ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                  {showWalletMenu && (
                    <div className="absolute top-10 right-0 w-48 bg-black border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-right">
                      <button className="flex items-center justify-end gap-2 w-full px-4 py-2 text-sm hover:bg-white/10">Historique <HistoryIcon className="w-4 h-4" /></button>
                      <button onClick={() => { setShowDepositModal(true); setShowWalletMenu(false); }} className="flex items-center justify-end gap-2 w-full px-4 py-2 text-sm hover:bg-white/10 text-yellow-500 font-bold">Dépôt <DollarSign className="w-4 h-4" /></button>
                      <button onClick={() => { setShowWithdrawModal(true); setShowWalletMenu(false); }} className="flex items-center justify-end gap-2 w-full px-4 py-2 text-sm hover:bg-white/10 text-red-500 font-bold">Retrait <Wallet className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <span className="text-sm font-bold text-white">{user.name}</span>
                <div className="relative">
                  <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowWalletMenu(false); }} className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-full border-2 border-yellow-400 p-0.5 overflow-hidden">
                      <img src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.name}`} alt="avatar" className="rounded-full w-full h-full" />
                      <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-48 bg-black border border-white/10 rounded-xl shadow-2xl py-2 z-50 text-right">
                    <div className="h-px bg-white/5 my-2"></div>
                    <button className="block w-full text-right px-4 py-2 text-sm hover:bg-white/10">Mon profil</button>
                    <button onClick={onLogout} className="block w-full text-right px-4 py-2 text-sm text-red-500 hover:bg-red-500/10">Déconnexion</button>
                  </div>
                  )}
                </div>
              </div>
            </nav>

      <div className="flex gap-2 px-6 py-3 bg-black/20 border-b border-white/5 text-xs font-bold uppercase tracking-wider">
        <button onClick={() => setView('main')} className={`${view === 'main' ? 'bg-yellow-500 text-black' : 'hover:bg-white/5'} px-4 py-2 rounded-lg flex items-center gap-2`}><Home className="w-4 h-4" /> Home</button>
        <button onClick={() => setView('cashGames')} className={`${view === 'cashGames' ? 'bg-yellow-500 text-black' : 'hover:bg-white/5'} px-4 py-2 rounded-lg flex items-center gap-2`}><DollarSign className="w-4 h-4" /> Cash Games</button>
        <button onClick={() => setView('tournaments')} className={`${view === 'tournaments' ? 'bg-yellow-500 text-black' : 'hover:bg-white/5'} px-4 py-2 rounded-lg flex items-center gap-2`}><Trophy className="w-4 h-4" /> Tournaments <span className="text-[10px] bg-red-600 px-1 rounded ml-1">NEW</span></button>
      </div>

      <main className="p-6 max-w-[1600px] mx-auto">
        {view === 'main' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[80vh]">
            <div className="lg:col-span-3">
              <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 group bg-gradient-to-b from-gray-900 to-black">
                <img src={slides[currentSlide].img} className="w-full h-full object-cover opacity-80 transition-opacity duration-1000" alt={slides[currentSlide].title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute top-12 left-0 right-0 text-center px-4">
                   <h1 className="text-4xl font-black italic tracking-tighter text-yellow-500 drop-shadow-2xl uppercase">
                     {slides[currentSlide].title.split(' ').map((word, i) => (<React.Fragment key={i}>{word}{i === 0 && <br/>}</React.Fragment>))}
                   </h1>
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">{slides[currentSlide].desc}</p>
                </div>
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
                   {slides.map((_, i) => (<div key={i} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all cursor-pointer ${i === currentSlide ? 'w-8 bg-yellow-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}></div>))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-gradient-to-r from-gray-900/80 to-black/80 rounded-3xl border border-white/10 p-12 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.05)_0%,transparent_70%)]"></div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2 relative z-10">JOUEZ AU MOINS 1 TOURNOI POUR</h2>
                <h3 className="text-2xl font-black text-yellow-500 italic relative z-10">ÊTRE CLASSÉ AU SCORE DE COMPÉTENCE</h3>
                <div className="mt-6 h-px w-32 bg-white/10 relative z-10"></div>
                <p className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] relative z-10">COMMENCEZ À JOUER MAINTENANT</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/30 rounded-3xl border border-white/5 p-6 space-y-6">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EXPLORE POKER FORMATS</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => setView('cashGames')} className="aspect-square bg-black/40 rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center gap-3 hover:border-yellow-500/50 transition-all cursor-pointer group">
                         <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign className="w-6 h-6 text-yellow-500" /></div>
                         <span className="text-[10px] font-black uppercase text-center">Cash Games</span>
                      </div>
                      <div onClick={() => setView('tournaments')} className="aspect-square bg-black/40 rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center gap-3 hover:border-yellow-500/50 transition-all cursor-pointer group">
                         <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Trophy className="w-6 h-6 text-green-500" /></div>
                         <span className="text-[10px] font-black uppercase text-center">Tournaments</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="bg-gray-900/30 rounded-3xl border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-all h-[180px] flex flex-col justify-center">
                      <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                      <h4 className="text-lg font-black italic">My Transactions</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Check out your withdrawal and deposit status</p>
                   </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gray-900/30 rounded-3xl border border-white/10 p-8 h-full">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">GAME STATS</h4>
                <div className="bg-black/40 rounded-2xl p-1 mb-8 flex"><button className="flex-1 py-3 bg-red-600 rounded-xl text-xs font-black uppercase italic tracking-wider">Cash</button><button className="flex-1 py-3 text-xs font-black uppercase italic tracking-wider text-gray-500">Tournament</button></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3 space-y-6">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                    <h2 className="text-sm font-black tracking-widest mb-6 uppercase text-yellow-500">FILTRES</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Rechercher</label>
                            <input type="text" placeholder="Nom de la table..." className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50" onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Type de jeu</label>
                            <div className="flex flex-col gap-2">
                                {['All', 'holdem', 'omaha'].map(type => (
                                    <button 
                                        key={type}
                                        onClick={() => { setGameFilter(type as any); setCurrentPage(1); }}
                                        className={`w-full px-4 py-2 rounded-xl text-xs font-bold uppercase text-left transition-all ${gameFilter === type ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:col-span-9 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">{view === 'cashGames' ? 'CASH GAMES' : 'TOURNOIS'} <span className="text-yellow-500 ml-2">LOBBY</span></h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedTables.map((t) => (
                        <div key={t.id} className="group relative w-full h-48 rounded-3xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-all bg-gray-900/40 backdrop-blur-sm">
                            <img src={getTableImage(t.id)} className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity group-hover:opacity-40" alt="Table background" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute top-5 right-5 bg-yellow-500 text-black px-3 py-1 rounded-full shadow-lg"><span className="font-black text-[10px] tracking-wider uppercase">{t.cave} MGA</span></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-xl font-black leading-tight mb-2 text-white group-hover:text-yellow-500 transition-colors uppercase italic">{t.name}</h3>
                                {t.playerNames && t.playerNames.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {t.playerNames.map((name: string, i: number) => (
                                      <span key={i} className="text-[8px] px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-200 font-bold uppercase tracking-tighter">
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col"><span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Type</span><span className="text-xs font-black text-white">{t.gameType.toUpperCase()}</span></div>
                                        <div className="w-px h-6 bg-white/10"></div>
                                        <div className="flex flex-col"><span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Joueurs</span><span className="text-xs font-black text-yellow-500 flex items-center gap-1"><User className="w-3 h-3" /> {t.currentPlayers || 0} / 9</span></div>
                                        <div className="w-px h-6 bg-white/10"></div>
                                        <div className="flex flex-col"><span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Blinds</span><span className="text-xs font-black text-white">{t.smallBlind}/{t.bigBlind}</span></div>
                                    </div>
                                    <button onClick={() => onJoinTable(t.id, Number(t.cave))} className="bg-white text-black h-10 w-10 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-all hover:scale-110 active:scale-95"><Play className="w-4 h-4 fill-current ml-0.5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button 
                      onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl font-black uppercase text-sm transition-all border border-white/10 ${currentPage === 1 ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Précédent
                    </button>
                    <span className="text-sm font-bold text-white">Page {currentPage} sur {totalPages}</span>
                    <button 
                      onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-xl font-black uppercase text-sm transition-all border border-white/10 ${currentPage === totalPages ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      Suivant
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};