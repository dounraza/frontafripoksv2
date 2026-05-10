const cardImages = import.meta.glob('/src/image/card2/*.svg', { eager: true });

export const getCardImage = (cardId) => {
    const finalId = cardId.replace('T', '0').toUpperCase();
    const path = `/src/image/card2/${finalId}.svg`;
    return cardImages[path]?.default || cardImages[path];
};
