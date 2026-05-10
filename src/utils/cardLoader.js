const cardImages = import.meta.glob('/src/image/card2/*.svg', { eager: true, import: 'default' });

export const getCardImage = (cardId) => {
    const finalId = cardId.replace('T', '0').toUpperCase();
    const path = `/src/image/card2/${finalId}.svg`;
    
    // Le glob eager donne directement l'URL traitée par Vite
    return cardImages[path];
};
