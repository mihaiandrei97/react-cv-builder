import { Font } from '@react-pdf/renderer'

import regular from '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff?url'
import italic from '@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff?url'
import semibold from '@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff?url'
import bold from '@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff?url'

Font.register({
  family: 'Source Serif 4',
  fonts: [
    { src: regular, fontWeight: 400 },
    { src: italic, fontWeight: 400, fontStyle: 'italic' },
    { src: semibold, fontWeight: 600 },
    { src: bold, fontWeight: 700 },
  ],
})

// Disable hyphenation
Font.registerHyphenationCallback((word) => [word])
