const CEFR_RE = /^(A1|A2|B1|B2|C1|C2)$/i

const KEYWORD_TO_CEFR: Array<[RegExp, string]> = [
  [/native|mother tongue/i, 'C2'],
  [/fluent|advanced/i, 'C1'],
  [/professional working|upper intermediate/i, 'B2'],
  [/intermediate/i, 'B1'],
  [/elementary|basic/i, 'A2'],
  [/beginner/i, 'A1'],
]

export function toCefrLevel(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'B1'

  if (CEFR_RE.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  for (const [pattern, level] of KEYWORD_TO_CEFR) {
    if (pattern.test(trimmed)) return level
  }

  return 'B1'
}

type LanguageLike = {
  proficiency?: string
  listening?: string
  reading?: string
  dialog?: string
  reproduce?: string
  writing?: string
  motherTongue?: boolean
}

type LanguageSkill = 'listening' | 'reading' | 'dialog' | 'reproduce' | 'writing'

const CEFR_RANK: Record<string, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
}

export function isMotherTongueLanguage(language: LanguageLike): boolean {
  return Boolean(language.motherTongue) || /native|mother/i.test(language.proficiency ?? '')
}

export function getLanguageLevel(language: LanguageLike, skill: LanguageSkill): string {
  return toCefrLevel(language[skill] ?? language.proficiency ?? '')
}

export function getOverallLevel(language: LanguageLike): string {
  const skills: LanguageSkill[] = ['listening', 'reading', 'dialog', 'reproduce', 'writing']
  const levels = skills
    .map((s) => language[s])
    .filter((v): v is string => Boolean(v))
  if (levels.length === 0) {
    return toCefrLevel(language.proficiency ?? '')
  }
  return levels.reduce((lowest, current) => {
    const a = toCefrLevel(lowest)
    const b = toCefrLevel(current)
    return (CEFR_RANK[b] ?? 0) < (CEFR_RANK[a] ?? 0) ? b : a
  }, toCefrLevel(levels[0]!))
}
