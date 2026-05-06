export interface Player {
  id: string;
  name: string;
  chips: number;
  bet: number;
  position: number;
  role?: string;
  lastAction?: string;
  cards?: any[];
  folded?: boolean;
}

export interface TableData {
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  currentBet: number;
  previousBet: number;
  bigBlind: number;
  smallBlind: number;
  pot: number;
  gameState: string;
  currentPhase: string;
}

export const getCallAmount = (tableData: any, myPlayer: any) => {
  if (!tableData || !myPlayer) return 0;
  const currentBet = tableData.currentBet || 0;
  const myBet = myPlayer.bet || 0;
  return Math.max(0, currentBet - myBet);
};

export const getMinRaiseTo = (tableData: any) => {
  if (!tableData) return 0;
  const currentBet = tableData.currentBet || 0;
  const lastRaiseIncrement = tableData.lastRaiseIncrement || tableData.bigBlind || 20;
  return currentBet + lastRaiseIncrement;
};

export const getMaxRaiseTo = (myPlayer: any) => {
  if (!myPlayer) return 0;
  return (myPlayer.chips || 0) + (myPlayer.bet || 0);
};

export const isPlayerTurn = (tableData: any, socketId: string | undefined) => {
  if (!tableData || !socketId || !tableData.players) return false;
  const currentPlayer = tableData.players.find((p: any) => p.position === tableData.currentPlayerIndex);
  
  // Un joueur ne peut avoir son tour que s'il est réellement dans la main
  if (!currentPlayer || currentPlayer.status === 'folded' || currentPlayer.status === 'out' || currentPlayer.status === 'waiting') return false;
  
  return currentPlayer?.id === socketId;
};

export const getPlayerRoleInfo = (player: any, tableData: any) => {
  const players = tableData.players || [];
  const presentPositions = players.map((p: any) => p.position).sort((a: any, b: any) => a - b);
  const numPresent = presentPositions.length;
  
  if (numPresent < 2) return { isDealer: false, isSB: false, isBB: false };

  const dealerIdx = presentPositions.indexOf(tableData.dealerIndex);
  const playerIdx = presentPositions.indexOf(player.position);
  
  if (dealerIdx === -1 || playerIdx === -1) {
    // Fallback to backend roles if position logic fails
    return {
      isDealer: player.role === 'dealer',
      isSB: player.role === 'small',
      isBB: player.role === 'big'
    };
  }

  const sequenceIndex = (playerIdx - dealerIdx + numPresent) % numPresent;

  let isDealer = player.position === tableData.dealerIndex;
  let isSB = false;
  let isBB = false;

  if (numPresent === 2) {
    // Heads-up: Dealer is SB, other is BB
    isSB = isDealer;
    isBB = !isDealer;
  } else {
    isSB = sequenceIndex === 1;
    isBB = sequenceIndex === 2;
  }

  return { isDealer, isSB, isBB };
};
