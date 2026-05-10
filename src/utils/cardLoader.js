import _0C from '../image/card2/0C.svg';
import _0D from '../image/card2/0D.svg';
import _0H from '../image/card2/0H.svg';
import _0S from '../image/card2/0S.svg';
import _2C from '../image/card2/2C.svg';
import _2D from '../image/card2/2D.svg';
import _2H from '../image/card2/2H.svg';
import _2S from '../image/card2/2S.svg';
import _3C from '../image/card2/3C.svg';
import _3D from '../image/card2/3D.svg';
import _3H from '../image/card2/3H.svg';
import _3S from '../image/card2/3S.svg';
import _4C from '../image/card2/4C.svg';
import _4D from '../image/card2/4D.svg';
import _4H from '../image/card2/4H.svg';
import _4S from '../image/card2/4S.svg';
import _5C from '../image/card2/5C.svg';
import _5D from '../image/card2/5D.svg';
import _5H from '../image/card2/5H.svg';
import _5S from '../image/card2/5S.svg';
import _6C from '../image/card2/6C.svg';
import _6D from '../image/card2/6D.svg';
import _6H from '../image/card2/6H.svg';
import _6S from '../image/card2/6S.svg';
import _7C from '../image/card2/7C.svg';
import _7D from '../image/card2/7D.svg';
import _7H from '../image/card2/7H.svg';
import _7S from '../image/card2/7S.svg';
import _8C from '../image/card2/8C.svg';
import _8D from '../image/card2/8D.svg';
import _8H from '../image/card2/8H.svg';
import _8S from '../image/card2/8S.svg';
import _9C from '../image/card2/9C.svg';
import _9D from '../image/card2/9D.svg';
import _9H from '../image/card2/9H.svg';
import _9S from '../image/card2/9S.svg';
import _AC from '../image/card2/AC.svg';
import _AD from '../image/card2/AD.svg';
import _AH from '../image/card2/AH.svg';
import _AS from '../image/card2/AS.svg';
import _JC from '../image/card2/JC.svg';
import _JD from '../image/card2/JD.svg';
import _JH from '../image/card2/JH.svg';
import _JS from '../image/card2/JS.svg';
import _KC from '../image/card2/KC.svg';
import _KD from '../image/card2/KD.svg';
import _KH from '../image/card2/KH.svg';
import _KS from '../image/card2/KS.svg';
import _QC from '../image/card2/QC.svg';
import _QD from '../image/card2/QD.svg';
import _QH from '../image/card2/QH.svg';
import _QS from '../image/card2/QS.svg';

const cardImages = {
    '/src/image/card2/0C.svg': _0C, '/src/image/card2/0D.svg': _0D, '/src/image/card2/0H.svg': _0H, '/src/image/card2/0S.svg': _0S,
    '/src/image/card2/2C.svg': _2C, '/src/image/card2/2D.svg': _2D, '/src/image/card2/2H.svg': _2H, '/src/image/card2/2S.svg': _2S,
    '/src/image/card2/3C.svg': _3C, '/src/image/card2/3D.svg': _3D, '/src/image/card2/3H.svg': _3H, '/src/image/card2/3S.svg': _3S,
    '/src/image/card2/4C.svg': _4C, '/src/image/card2/4D.svg': _4D, '/src/image/card2/4H.svg': _4H, '/src/image/card2/4S.svg': _4S,
    '/src/image/card2/5C.svg': _5C, '/src/image/card2/5D.svg': _5D, '/src/image/card2/5H.svg': _5H, '/src/image/card2/5S.svg': _5S,
    '/src/image/card2/6C.svg': _6C, '/src/image/card2/6D.svg': _6D, '/src/image/card2/6H.svg': _6H, '/src/image/card2/6S.svg': _6S,
    '/src/image/card2/7C.svg': _7C, '/src/image/card2/7D.svg': _7D, '/src/image/card2/7H.svg': _7H, '/src/image/card2/7S.svg': _7S,
    '/src/image/card2/8C.svg': _8C, '/src/image/card2/8D.svg': _8D, '/src/image/card2/8H.svg': _8H, '/src/image/card2/8S.svg': _8S,
    '/src/image/card2/9C.svg': _9C, '/src/image/card2/9D.svg': _9D, '/src/image/card2/9H.svg': _9H, '/src/image/card2/9S.svg': _9S,
    '/src/image/card2/AC.svg': _AC, '/src/image/card2/AD.svg': _AD, '/src/image/card2/AH.svg': _AH, '/src/image/card2/AS.svg': _AS,
    '/src/image/card2/JC.svg': _JC, '/src/image/card2/JD.svg': _JD, '/src/image/card2/JH.svg': _JH, '/src/image/card2/JS.svg': _JS,
    '/src/image/card2/KC.svg': _KC, '/src/image/card2/KD.svg': _KD, '/src/image/card2/KH.svg': _KH, '/src/image/card2/KS.svg': _KS,
    '/src/image/card2/QC.svg': _QC, '/src/image/card2/QD.svg': _QD, '/src/image/card2/QH.svg': _QH, '/src/image/card2/QS.svg': _QS,
};

export const getCardImage = (cardId) => {
    const finalId = cardId.replace('T', '0').toUpperCase();
    const path = `/src/image/card2/${finalId}.svg`;
    return cardImages[path];
};
