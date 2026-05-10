const cardImages = import.meta.glob('/src/image/card2/*.svg', { eager: true, query: '?url', import: 'default' });

export const getCardImage = (cardId) => {
    // Vite needs the path to start with /src/
    const finalId = cardId.replace('T', '0').toUpperCase();
    const path = `/src/image/card2/${finalId}.svg`;
    
    // Accéder au résultat du glob
    return cardImages[path];
};
