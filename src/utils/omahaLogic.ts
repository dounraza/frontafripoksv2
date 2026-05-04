/**
 * Omaha Poker Logic
 * Rule: Exactly 2 cards from hand and 3 cards from board.
 */

export interface Card {
  value: string;
  suit: string;
}

/**
 * Generates all combinations of k elements from an array
 */
function getCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];
  
  function combine(start: number, current: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      current.push(array[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  
  combine(0, []);
  return result;
}

/**
 * Returns all possible 5-card hands for Omaha
 * (Exactly 2 from hand, Exactly 3 from board)
 */
export const getOmahaHands = (handCards: Card[], boardCards: Card[]): Card[][] => {
  if (handCards.length < 2 || boardCards.length < 3) return [];
  
  const handCombinations = getCombinations(handCards, 2);
  const boardCombinations = getCombinations(boardCards, 3);
  
  const allPossibleHands: Card[][] = [];
  
  for (const hComb of handCombinations) {
    for (const bComb of boardCombinations) {
      allPossibleHands.push([...hComb, ...bComb]);
    }
  }
  
  return allPossibleHands;
};

/**
 * Note: Hand evaluation (ranking which 5-card hand is better) 
 * is typically handled by the backend for security and consistency.
 * This frontend logic is useful for displaying potential hands or 
 * highlighting the cards being used in the best hand.
 */
