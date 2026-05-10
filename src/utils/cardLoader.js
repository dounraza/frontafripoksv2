const cards = import.meta.glob("/src/image/card2/*.svg", {
  eager: true,
  import: "default",
});

export const getCardImage = (cardId) => {
  const finalId = cardId.replace('T', '0').toUpperCase();
  const path = `/src/image/card2/${finalId}.svg`;
  
  const src = cards[path];
  
  if (!src) {
    console.warn(`Carte non trouvée : ${path}`);
    return null;
  }
  
  return src;
};
