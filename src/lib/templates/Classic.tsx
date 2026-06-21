import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ClassicCvData } from '../types'
import { getDefaultSectionLabel } from '../types'
import '../fonts'
import { getLanguageLevel } from './language-level'

const PAPER = '#fcfcf8'
const INK = '#222222'
const MUTED = '#5d5d55'
const LINE = '#d4d0c4'
const ACCENT = '#c06b31'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Classic Serif TTF',
    fontSize: 10,
    color: INK,
    backgroundColor: PAPER,
    paddingTop: '14mm',
    paddingBottom: '14mm',
    paddingLeft: '14mm',
    paddingRight: '14mm',
  },

  // Header
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    marginBottom: 10,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 7,
    fontWeight: 700,
    color: ACCENT,
    marginBottom: 3,
  },
  heroName: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: 3,
  },
  heroRole: {
    fontSize: 10,
    color: MUTED,
  },
  contactList: {
    alignItems: 'flex-end',
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.6,
  },
  contactItem: {
    marginBottom: 1,
  },

  // Sections
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: ACCENT,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingBottom: 3,
    marginBottom: 6,
  },
  paragraph: {
    lineHeight: 1.5,
    fontSize: 9.5,
  },

  // Skills grid (two columns)
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillItem: {
    width: '50%',
    fontSize: 9,
    marginBottom: 2.5,
  },

  // Languages table
  langTable: {
    borderWidth: 1,
    borderColor: LINE,
  },
  langMotherRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langGroupRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    backgroundColor: '#f7f4eb',
  },
  langSubHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f7f4eb',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langHeaderCell: {
    fontSize: 7.5,
    fontWeight: 700,
    color: MUTED,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    borderRightWidth: 1,
    borderRightColor: LINE,
  },
  langCell: {
    fontSize: 8.5,
    color: INK,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    borderRightWidth: 1,
    borderRightColor: LINE,
  },
  langColName: {
    width: '30%',
  },
  langColTwo: {
    width: '28%',
  },
  langColLevel: {
    width: '14%',
  },
  langNote: {
    marginTop: 6,
    fontSize: 7.2,
    lineHeight: 1.4,
    color: MUTED,
  },

  // Experience
  experienceItem: {
    marginTop: 7,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  experienceTitle: {
    fontSize: 10,
    fontWeight: 700,
    flex: 1,
  },
  experiencePeriod: {
    fontSize: 8.5,
    color: MUTED,
    flexShrink: 0,
    marginLeft: 8,
  },
  bulletList: {
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 9,
    marginRight: 5,
    color: MUTED,
    width: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.45,
    color: INK,
  },

  // Projects
  projectItem: {
    marginTop: 7,
  },
  projectName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 9,
    lineHeight: 1.45,
    marginBottom: 2,
  },
  projectStack: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: MUTED,
  },
})

function normalizeForPdf(text: string): string {
  return text.normalize('NFC')
}

export function ClassicDocument({ cv }: { cv: ClassicCvData }) {
  const accent = cv.colors.accent ?? ACCENT
  const ink = cv.colors.ink ?? INK
  const muted = cv.colors.muted ?? MUTED
  const t = (value: string) => normalizeForPdf(value)
  const label = (key: string) => t(cv.sectionLabels[key] ?? getDefaultSectionLabel('classic', key, cv.locale))

  const customIds = cv.customSections.map((s) => s.id)
  const ordered = [...['skills', 'experience', 'projects', 'education', 'languages'], ...customIds].sort(
    (a, b) => {
      const ai = cv.sectionOrder.indexOf(a); const bi = cv.sectionOrder.indexOf(b)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    }
  )
  const motherTongue = cv.languages[0]
  const otherLanguages = cv.languages.slice(1)
  const motherTongueLabel = t(motherTongue?.language || 'Romanian')

  return (
    <Document key={cv.sectionOrder.join(',') + JSON.stringify(cv.colors)}>
      <Page size="A4" style={[styles.page, { backgroundColor: PAPER, color: ink }]}>
        {/* Header */}
        <View style={[styles.hero, { borderBottomColor: accent }]}>
          <View>
            <Text style={[styles.heroName, { color: accent }]}>{t(cv.profile.name)}</Text>
            <Text style={[styles.heroRole, { color: muted }]}>{t(cv.profile.title)}</Text>
          </View>
          <View style={styles.contactList}>
            <Text style={[styles.contactItem, { color: muted }]}>{t(cv.profile.location)}</Text>
            <Text style={[styles.contactItem, { color: muted }]}>{t(cv.profile.email)}</Text>
            <Text style={[styles.contactItem, { color: muted }]}>{t(cv.profile.website)}</Text>
          </View>
        </View>

        {/* Profile — always first */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('profile')}</Text>
          <Text style={styles.paragraph}>{t(cv.profile.summary)}</Text>
        </View>

        {ordered.map((key) => {
          if (key === 'skills' && cv.skills.length > 0) return (
            <View key="skills" style={styles.section} break={cv.pageBreaks.includes('skills')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('skills')}</Text>
              <View style={styles.skillGrid}>
                {cv.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillItem}>{t(skill)}</Text>
                ))}
              </View>
            </View>
          )
          if (key === 'experience' && cv.experiences.length > 0) return (
            <View key="experience" style={styles.section} break={cv.pageBreaks.includes('experience')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('experience')}</Text>
              {cv.experiences.map((exp) => (
                <View key={exp.id} style={styles.experienceItem} wrap={false}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{t(exp.role)} – {t(exp.company)}</Text>
                    <Text style={[styles.experiencePeriod, { color: muted }]}>{t(exp.period)}</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={[styles.bulletDot, { color: muted }]}>•</Text>
                        <Text style={[styles.bulletText, { color: ink }]}>{t(h)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )
          if (key === 'projects' && cv.projects.length > 0) return (
            <View key="projects" style={styles.section} break={cv.pageBreaks.includes('projects')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('projects')}</Text>
              {cv.projects.map((project) => (
                <View key={project.id} style={styles.projectItem} wrap={false}>
                  <Text style={styles.projectName}>{t(project.name)}</Text>
                  <Text style={styles.projectDesc}>{t(project.description)}</Text>
                  <Text style={[styles.projectStack, { color: muted }]}>{t(project.stack)}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'education' && cv.education.length > 0) return (
            <View key="education" style={styles.section} break={cv.pageBreaks.includes('education')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('education')}</Text>
              {cv.education.map((edu) => (
                <View key={edu.id} style={styles.experienceItem} wrap={false}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{t(edu.degree)}</Text>
                    <Text style={[styles.experiencePeriod, { color: muted }]}>{t(edu.period)}</Text>
                  </View>
                  <Text style={{ fontSize: 9, color: muted, marginTop: 1 }}>{t(edu.institution)}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'languages' && cv.languages.length > 0) return (
            <View key="languages" style={styles.section} break={cv.pageBreaks.includes('languages')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{label('languages')}</Text>
              <View style={styles.langTable}>
                <View style={styles.langMotherRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName, { color: muted }]}>Mother Tongue</Text>
                  <Text style={[styles.langCell, { width: '70%', borderRightWidth: 0, color: ink }]}>{motherTongueLabel}</Text>
                </View>
                <View style={styles.langGroupRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName, { color: muted }]}>{''}</Text>
                  <Text style={[styles.langHeaderCell, styles.langColTwo, { color: muted }]}>Understanding</Text>
                  <Text style={[styles.langHeaderCell, styles.langColTwo, { color: muted }]}>Speaking</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted, borderRightWidth: 0 }]}>Writing</Text>
                </View>
                <View style={styles.langSubHeaderRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName, { color: muted }]}>Other languages</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted }]}>Listening</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted }]}>Reading</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted }]}>Dialog</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted }]}>Reproduce</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { color: muted, borderRightWidth: 0 }]}>{''}</Text>
                </View>
                {otherLanguages.map((lang, i) => (
                  <View key={lang.id} style={i === otherLanguages.length - 1 ? [styles.langRow, { borderBottomWidth: 0 }] : styles.langRow}>
                    <Text style={[styles.langCell, styles.langColName, { color: ink }]}>{t(lang.language)}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { color: ink }]}>{getLanguageLevel(lang, 'listening')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { color: ink }]}>{getLanguageLevel(lang, 'reading')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { color: ink }]}>{getLanguageLevel(lang, 'dialog')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { color: ink }]}>{getLanguageLevel(lang, 'reproduce')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { color: ink, borderRightWidth: 0 }]}>{getLanguageLevel(lang, 'writing')}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.langNote, { color: muted }]}>Levels: A1/A2: Basic user - B1/B2: Independent user - C1/C2: Proficient user</Text>
              <Text style={[styles.langNote, { color: muted }]}>Common European Framework of Reference for Language</Text>
            </View>
          )
          const custom = cv.customSections.find((s) => s.id === key)
          if (custom) return (
            <View key={key} style={styles.section} break={cv.pageBreaks.includes(key)}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{t(custom.title)}</Text>
              {custom.bullets.filter(Boolean).map((b, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: muted }]}>{'•'}</Text>
                  <Text style={[styles.bulletText, { color: ink }]}>{t(b)}</Text>
                </View>
              ))}
            </View>
          )
          return null
        })}
      </Page>
    </Document>
  )
}
