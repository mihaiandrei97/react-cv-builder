import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { CompactCvData } from '../types'
import { getDefaultSectionLabel } from '../types'
import '../fonts'
import { getLanguageLevel } from './language-level'

const PAPER = '#ffffff'
const INK = '#111111'
const MUTED = '#606060'
const LINE = '#e0ddd4'
const ACCENT = '#1a5c8a'

const COL_LEFT = '34%'
const COL_RIGHT = '66%'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Classic Serif TTF',
    fontSize: 10,
    color: INK,
    backgroundColor: PAPER,
  },

  // Top header bar
  topBar: {
    backgroundColor: ACCENT,
    paddingTop: '10mm',
    paddingBottom: '10mm',
    paddingLeft: '14mm',
    paddingRight: '14mm',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: -0.3,
    lineHeight: 1.1,
  },
  jobTitle: {
    fontSize: 9,
    color: '#bcd8ee',
    marginTop: 3,
  },
  contactColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  contactItem: {
    fontSize: 8,
    color: '#cce0f0',
  },

  // Body: two columns
  body: {
    flexDirection: 'row',
    flex: 1,
  },

  // Left column
  leftCol: {
    width: COL_LEFT,
    paddingTop: '10mm',
    paddingBottom: '10mm',
    paddingLeft: '12mm',
    paddingRight: '8mm',
    borderRightWidth: 1,
    borderRightColor: LINE,
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#f9f8f5',
  },
  sideSection: {},
  sideSectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: ACCENT,
    marginBottom: 6,
  },

  // Skills
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillLabel: {
    fontSize: 8.5,
    flex: 1,
  },

  // Languages
  langItem: {
    marginBottom: 5,
  },
  langName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
  },
  langLevel: {
    fontSize: 7.5,
    color: MUTED,
  },
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
    backgroundColor: '#f1f6fb',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langSubHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f6fb',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langHeaderCell: {
    fontSize: 6.4,
    fontWeight: 700,
    color: MUTED,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 4,
    paddingRight: 4,
    borderRightWidth: 1,
    borderRightColor: LINE,
  },
  langCell: {
    fontSize: 7.2,
    color: INK,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 4,
    paddingRight: 4,
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
  langSectionBottom: {
    paddingTop: '6mm',
    paddingBottom: '10mm',
    paddingLeft: '12mm',
    paddingRight: '12mm',
  },
  langSectionTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: INK,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  langNote: {
    marginTop: 5,
    fontSize: 6.8,
    lineHeight: 1.35,
    color: MUTED,
  },

  // Right column
  rightCol: {
    width: COL_RIGHT,
    paddingTop: '10mm',
    paddingBottom: '10mm',
    paddingLeft: '10mm',
    paddingRight: '12mm',
    flexDirection: 'column',
    gap: 12,
  },
  mainSection: {},
  mainSectionTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: INK,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },

  // Summary
  summary: {
    fontSize: 9,
    lineHeight: 1.55,
    color: MUTED,
  },

  // Experience
  expItem: {
    marginBottom: 9,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  expRole: {
    fontSize: 10,
    fontWeight: 700,
  },
  expPeriod: {
    fontSize: 8,
    color: MUTED,
    flexShrink: 0,
    marginLeft: 6,
    marginTop: 1,
  },
  expCompany: {
    fontSize: 8.5,
    color: ACCENT,
    marginBottom: 3,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 8.5,
    marginRight: 5,
    color: MUTED,
    width: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.4,
    color: INK,
  },

  // Education
  eduItem: {
    marginBottom: 6,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  eduDegree: {
    fontSize: 9.5,
    fontWeight: 700,
  },
  eduPeriod: {
    fontSize: 8,
    color: MUTED,
    flexShrink: 0,
    marginLeft: 6,
  },
  eduInstitution: {
    fontSize: 8.5,
    color: MUTED,
  },
})

export function CompactDocument({ cv }: { cv: CompactCvData }) {
  const accent = cv.colors.accent ?? ACCENT
  const ink = cv.colors.ink ?? INK
  const muted = cv.colors.muted ?? MUTED
  const label = (key: string) => cv.sectionLabels[key] ?? getDefaultSectionLabel('compact', key, cv.locale)
  const motherTongue = cv.languages[0]
  const otherLanguages = cv.languages.slice(1)
  const motherTongueLabel = motherTongue?.language || 'Romanian'
  const customIds = cv.customSections.map((s) => s.id)
  const orderedMain = [...['experience', 'education', 'languages'], ...customIds].sort((a, b) => {
    const ai = cv.sectionOrder.indexOf(a)
    const bi = cv.sectionOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <Document key={JSON.stringify(cv.colors)}>
      <Page size="A4" style={[styles.page, { color: ink }]}>
        {/* Top bar */}
        <View style={[styles.topBar, { backgroundColor: accent }]}>
          <View>
            <Text style={styles.name}>{cv.profile.name}</Text>
            <Text style={styles.jobTitle}>{cv.profile.title}</Text>
          </View>
          <View style={styles.contactColumn}>
            <Text style={styles.contactItem}>{cv.profile.location}</Text>
            <Text style={styles.contactItem}>{cv.profile.email}</Text>
            <Text style={styles.contactItem}>{cv.profile.website}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Left column */}
          <View style={styles.leftCol}>
            {/* Summary */}
            <View style={styles.sideSection}>
              <Text style={[styles.sideSectionTitle, { color: accent }]}>{label('about')}</Text>
              <Text style={styles.summary}>{cv.profile.summary}</Text>
            </View>

            {/* Skills */}
            {cv.skills.length > 0 && (
              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionTitle, { color: accent }]}>{label('skills')}</Text>
                {cv.skills.map((skill, i) => (
                  <View key={i} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>

          {/* Right column */}
          <View style={styles.rightCol}>
            {orderedMain.map((key) => {
              if (key === 'experience' && cv.experiences.length > 0) return (
                <View key="experience" style={styles.mainSection} break={cv.pageBreaks.includes('experience')}>
                  <Text style={styles.mainSectionTitle}>{label('experience')}</Text>
                  {cv.experiences.map((exp) => (
                    <View key={exp.id} style={styles.expItem}>
                      <View style={styles.expHeader}>
                        <Text style={styles.expRole}>{exp.role}</Text>
                        <Text style={[styles.expPeriod, { color: muted }]}>{exp.period}</Text>
                      </View>
                      <Text style={[styles.expCompany, { color: accent }]}>{exp.company}</Text>
                      {exp.highlights.map((h, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={[styles.bulletDot, { color: muted }]}>·</Text>
                          <Text style={[styles.bulletText, { color: ink }]}>{h}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )

              if (key === 'education' && cv.education.length > 0) return (
                <View key="education" style={styles.mainSection} break={cv.pageBreaks.includes('education')}>
                  <Text style={styles.mainSectionTitle}>{label('education')}</Text>
                  {cv.education.map((edu) => (
                    <View key={edu.id} style={styles.eduItem}>
                      <View style={styles.eduHeader}>
                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                        <Text style={[styles.eduPeriod, { color: muted }]}>{edu.period}</Text>
                      </View>
                      <Text style={[styles.eduInstitution, { color: muted }]}>{edu.institution}</Text>
                    </View>
                  ))}
                </View>
              )

              if (key === 'languages' && cv.languages.length > 0) return (
                <View key="languages" style={styles.mainSection} break={cv.pageBreaks.includes('languages')}>
                  <Text style={styles.mainSectionTitle}>{label('languages')}</Text>
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
                        <Text style={[styles.langCell, styles.langColName, { color: ink }]}>{lang.language}</Text>
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

              const custom = cv.customSections.find((section) => section.id === key)
              if (!custom) return null
              return (
                <View key={custom.id} style={styles.mainSection} break={cv.pageBreaks.includes(custom.id)}>
                  <Text style={styles.mainSectionTitle}>{custom.title}</Text>
                  {custom.bullets.filter(Boolean).map((b, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={[styles.bulletDot, { color: muted }]}>·</Text>
                      <Text style={[styles.bulletText, { color: ink }]}>{b}</Text>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>
        </View>
      </Page>
    </Document>
  )
}
