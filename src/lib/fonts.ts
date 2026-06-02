import { Font } from '@react-pdf/renderer'

import classicRegular from '../assets/fonts/classic/NotoSerif-Regular-subset.woff?url'
import classicItalic from '../assets/fonts/classic/NotoSerif-Italic-subset.woff?url'
import classicSemibold from '../assets/fonts/classic/NotoSerif-SemiBold-subset.woff?url'
import classicBold from '../assets/fonts/classic/NotoSerif-Bold-subset.woff?url'

Font.register({
  family: 'Classic Serif TTF',
  fonts: [
    { src: classicRegular, fontWeight: 400 },
    { src: classicItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: classicSemibold, fontWeight: 600 },
    { src: classicBold, fontWeight: 700 },
  ],
})

// Disable hyphenation
Font.registerHyphenationCallback((word) => [word])
