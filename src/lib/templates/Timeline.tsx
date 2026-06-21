import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { TimelineCvData } from '../types'
import { getDefaultSectionLabel } from '../types'
import '../fonts'
import { getLanguageLevel } from './language-level'

const PAPER = '#ffffff'
const INK = '#1c1c1a'
const MUTED = '#6b6b62'
const LINE = '#d8d4ca'
const ACCENT = '#0f766e'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Classic Serif TTF',
    fontSize: 10,
    color: INK,
    backgroundColor: PAPER,
    paddingTop: '16mm',
    paddingBottom: '16mm',
    paddingLeft: '18mm',
    paddingRight: '18mm',
  },

  // Header — centered
  header: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 0.3,
    lineHeight: 1.15,
    marginBottom: 4,
  },
  role: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    fontSize: 8.5,
    color: MUTED,
    justifyContent: 'center',
  },
  contactSep: {
    color: LINE,
  },

  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: INK,
  },

  // Skills — inline comma-separated
  skillsInline: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: INK,
  },

  // Timeline entries (experience)
  timelineEntry: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  timelineLeft: {
    width: 16,
    alignItems: 'center',
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: ACCENT,
    marginTop: 4,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: ACCENT,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  timelineRole: {
    fontSize: 10.5,
    fontWeight: 700,
    color: INK,
  },
  timelinePeriod: {
    fontSize: 8.5,
    color: MUTED,
    fontStyle: 'italic',
    flexShrink: 0,
    marginLeft: 8,
    marginTop: 1,
  },
  timelineCompany: {
    fontSize: 9,
    color: ACCENT,
    fontWeight: 600,
    marginBottom: 4,
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
    width: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
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
    lineHeight: 1.5,
    marginBottom: 2,
  },
  projectStack: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: MUTED,
  },

  // Education
  eduItem: {
    marginTop: 6,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  eduDegree: {
    fontSize: 10,
    fontWeight: 700,
  },
  eduPeriod: {
    fontSize: 8.5,
    color: MUTED,
    fontStyle: 'italic',
    flexShrink: 0,
    marginLeft: 8,
  },
  eduInstitution: {
    fontSize: 9,
    color: MUTED,
  },

  // Languages table
  langTable: {
    borderWidth: 0.5,
    borderColor: LINE,
  },
  langMotherRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  langGroupRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  langSubHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  langRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  langHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: MUTED,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
    textAlign: 'center',
  },
  langCell: {
    fontSize: 8.5,
    color: INK,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 5,
    paddingRight: 5,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
    textAlign: 'center',
  },
  langColName: {
    width: '30%',
    textAlign: 'left',
  },
  langColTwo: {
    width: '28%',
  },
  langColLevel: {
    width: '14%',
  },
  langNote: {
    marginTop: 6,
    fontSize: 7,
    lineHeight: 1.35,
    color: MUTED,
  },
})

function normalizeForPdf(text: string): string {
  return text.normalize('NFC')
}

export function TimelineDocument({ cv }: { cv: TimelineCvData }) {
  // Defensive fallbacks: skills/projects may be absent during template-switch transitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const skills: typeof cv.skills = (cv as any).skills ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: typeof cv.projects = (cv as any).projects ?? []
  const accent = cv.colors.accent ?? ACCENT
  const ink = cv.colors.ink ?? INK
  const muted = cv.colors.muted ?? MUTED
  const t = (value: string) => normalizeForPdf(value)
  const label = (key: string) => t(cv.sectionLabels[key] ?? getDefaultSectionLabel('timeline', key, cv.locale))

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
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <Text style={[styles.name, { color: ink }]}>{t(cv.profile.name)}</Text>
          <Text style={[styles.role, { color: muted }]}>{t(cv.profile.title)}</Text>
          <View style={styles.contactRow}>
            <Text style={{ color: muted }}>{t(cv.profile.location)}</Text>
            <Text style={[styles.contactSep, { color: muted }]}>{'·'}</Text>
            <Text style={{ color: muted }}>{t(cv.profile.email)}</Text>
            <Text style={[styles.contactSep, { color: muted }]}>{'·'}</Text>
            <Text style={{ color: muted }}>{t(cv.profile.website)}</Text>
          </View>
        </View>

        {/* Profile — always first */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: accent }]}>{label('profile')}</Text>
          <Text style={styles.paragraph}>{t(cv.profile.summary)}</Text>
        </View>

        {ordered.map((key) => {
          if (key === 'skills' && skills.length > 0) return (
            <View key="skills" style={styles.section} break={cv.pageBreaks.includes('skills')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{label('skills')}</Text>
              <Text style={styles.skillsInline}>
                {skills.map((skill, i) => (
                  <Text key={i}>
                    {i > 0 ? <Text style={{ color: muted }}>{'  ·  '}</Text> : null}
                    <Text>{t(skill)}</Text>
                  </Text>
                ))}
              </Text>
            </View>
          )
          if (key === 'experience' && cv.experiences.length > 0) return (
            <View key="experience" style={styles.section} break={cv.pageBreaks.includes('experience')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{label('experience')}</Text>
              {cv.experiences.map((exp, idx) => {
                const isLast = idx === cv.experiences.length - 1
                return (
                  <View key={exp.id} style={styles.timelineEntry} wrap={false}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: accent }]} />
                      {!isLast && <View style={[styles.timelineLine, { backgroundColor: accent }]} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={[styles.timelineRole, { color: ink }]}>{t(exp.role)}</Text>
                        <Text style={[styles.timelinePeriod, { color: muted }]}>{t(exp.period)}</Text>
                      </View>
                      <Text style={[styles.timelineCompany, { color: accent }]}>{t(exp.company)}</Text>
                      <View style={styles.bulletList}>
                        {exp.highlights.map((h, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <Text style={[styles.bulletDot, { color: muted }]}>{'—'}</Text>
                            <Text style={[styles.bulletText, { color: ink }]}>{t(h)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )
          if (key === 'projects' && projects.length > 0) return (
            <View key="projects" style={styles.section} break={cv.pageBreaks.includes('projects')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{label('projects')}</Text>
              {projects.map((project) => (
                <View key={project.id} style={styles.projectItem} wrap={false}>
                  <Text style={[styles.projectName, { color: ink }]}>{t(project.name)}</Text>
                  <Text style={styles.projectDesc}>{t(project.description)}</Text>
                  <Text style={[styles.projectStack, { color: muted }]}>{t(project.stack)}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'education' && cv.education.length > 0) return (
            <View key="education" style={styles.section} break={cv.pageBreaks.includes('education')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{label('education')}</Text>
              {cv.education.map((edu) => (
                <View key={edu.id} style={styles.eduItem} wrap={false}>
                  <View style={styles.eduHeader}>
                    <Text style={[styles.eduDegree, { color: ink }]}>{t(edu.degree)}</Text>
                    <Text style={[styles.eduPeriod, { color: muted }]}>{t(edu.period)}</Text>
                  </View>
                  <Text style={[styles.eduInstitution, { color: muted }]}>{t(edu.institution)}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'languages' && cv.languages.length > 0) return (
            <View key="languages" style={styles.section} break={cv.pageBreaks.includes('languages')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{label('languages')}</Text>
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
              <Text style={[styles.sectionTitle, { color: accent }]}>{t(custom.title)}</Text>
              {custom.bullets.filter(Boolean).map((b, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: muted }]}>{'—'}</Text>
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
