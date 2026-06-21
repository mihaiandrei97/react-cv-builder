import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { SidebarCvData } from '../types'
import { getDefaultSectionLabel } from '../types'
import '../fonts'
import { getOverallLevel, isMotherTongueLanguage } from './language-level'

const SIDEBAR_BG = '#f6f1e7'
const SIDEBAR_INK = '#1c1c1a'
const SIDEBAR_MUTED = '#6b6b62'
const SIDEBAR_DIVIDER = '#e0d9c8'
const SIDEBAR_CHIP_BG = '#efe8d6'
const SIDEBAR_CHIP_BORDER = '#e0d9c8'
const SIDEBAR_CHIP_TEXT = '#3a3530'
const MAIN_BG = '#ffffff'
const MAIN_INK = '#1c1c1a'
const MAIN_BODY = '#3a3530'
const MAIN_MUTED = '#6b6b62'
const ACCENT = '#1f3a5f'

const SIDEBAR_WIDTH = '36%'
const MAIN_WIDTH = '64%'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Classic Serif TTF',
    fontSize: 10,
    backgroundColor: MAIN_BG,
  },

  // Sidebar background — fixed so it repeats on every overflow page
  sidebarBg: {
    position: 'absolute',
    top: 0,
    left: MAIN_WIDTH,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: SIDEBAR_BG,
    borderLeftWidth: 1.5,
    borderLeftColor: ACCENT,
  },

  // Sidebar content — absolutely positioned, appears on page 1 only
  sidebar: {
    position: 'absolute',
    top: '14mm',
    left: MAIN_WIDTH,
    width: SIDEBAR_WIDTH,
    paddingLeft: '10mm',
    paddingRight: '10mm',
    flexDirection: 'column',
    gap: 14,
  },
  sidebarName: {
    fontSize: 15,
    fontWeight: 700,
    color: SIDEBAR_INK,
    lineHeight: 1.15,
    marginBottom: 3,
  },
  sidebarTitle: {
    fontSize: 8,
    color: ACCENT,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  sidebarSectionTitle: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: ACCENT,
    borderBottomWidth: 0.5,
    borderBottomColor: SIDEBAR_DIVIDER,
    paddingBottom: 3,
    marginBottom: 6,
  },
  contactItem: {
    marginBottom: 4,
  },
  contactLabel: {
    fontSize: 6,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: SIDEBAR_MUTED,
    marginBottom: 1,
  },
  contactValue: {
    fontSize: 7.5,
    color: '#3a3530',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skillChip: {
    fontSize: 7,
    fontWeight: 400,
    backgroundColor: SIDEBAR_CHIP_BG,
    color: SIDEBAR_CHIP_TEXT,
    borderWidth: 0.5,
    borderColor: SIDEBAR_CHIP_BORDER,
    borderRadius: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    marginBottom: 2,
  },

  // Compact languages list
  langItem: {
    marginBottom: 5,
  },
  langName: {
    fontSize: 8,
    fontWeight: 700,
    color: SIDEBAR_INK,
  },
  langLevel: {
    fontSize: 7,
    color: SIDEBAR_MUTED,
    marginTop: 1,
  },
  langNote: {
    marginTop: 6,
    fontSize: 6.2,
    lineHeight: 1.35,
    color: SIDEBAR_MUTED,
  },

  // Main content — flows naturally; width reserves space for sidebar
  main: {
    width: MAIN_WIDTH,
    paddingTop: '14mm',
    paddingBottom: '14mm',
    paddingLeft: '14mm',
    paddingRight: '11mm',
    flexDirection: 'column',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: MAIN_INK,
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
    paddingBottom: 3,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.55,
    color: MAIN_BODY,
  },

  // Entry
  entry: {
    marginTop: 7,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryRole: {
    fontSize: 9,
    fontWeight: 700,
    color: MAIN_INK,
    marginBottom: 1,
  },
  entryCompany: {
    fontSize: 8,
    color: MAIN_MUTED,
  },
  entryPeriod: {
    fontSize: 7.5,
    color: '#8a857a',
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
    fontSize: 8.5,
    marginRight: 4,
    color: MAIN_MUTED,
    width: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.45,
    color: MAIN_BODY,
  },
  projectStack: {
    fontSize: 7.5,
    fontStyle: 'italic',
    color: ACCENT,
  },
  projectDesc: {
    fontSize: 8,
    lineHeight: 1.45,
    color: MAIN_BODY,
    marginTop: 2,
    marginBottom: 2,
  },
})

export function SidebarDocument({ cv }: { cv: SidebarCvData }) {
  const sidebarBg = cv.colors.sidebarBg ?? SIDEBAR_BG
  const accent = cv.colors.accent ?? ACCENT
  const ink = cv.colors.ink ?? MAIN_INK
  const muted = cv.colors.muted ?? MAIN_MUTED
  const label = (key: string) => cv.sectionLabels[key] ?? getDefaultSectionLabel('sidebar', key, cv.locale)

  const customIds = cv.customSections.map((s) => s.id)
  const orderedMain = [...['experience', 'projects', 'education'], ...customIds].sort((a, b) => {
    const ai = cv.sectionOrder.indexOf(a); const bi = cv.sectionOrder.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <Document key={cv.sectionOrder.join(',') + JSON.stringify(cv.colors)}>
      <Page size="A4" style={styles.page}>
        {/* Light sidebar background — fixed so it appears on every overflow page */}
        <View style={[styles.sidebarBg, { backgroundColor: sidebarBg, borderLeftColor: accent }]} fixed />

        {/* Sidebar content — not fixed, so only renders on page 1 */}
        <View style={styles.sidebar}>
          <View>
            <Text style={[styles.sidebarName, { color: ink }]}>{cv.profile.name}</Text>
            <Text style={[styles.sidebarTitle, { color: accent }]}>{cv.profile.title}</Text>
          </View>

          <View>
            <Text style={[styles.sidebarSectionTitle, { color: accent }]}>{label('contact')}</Text>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactValue}>{cv.profile.location}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{cv.profile.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Web</Text>
              <Text style={styles.contactValue}>{cv.profile.website}</Text>
            </View>
          </View>

          {cv.skills.length > 0 && (
            <View>
              <Text style={[styles.sidebarSectionTitle, { color: accent }]}>{label('skills')}</Text>
              <View style={styles.skillsWrap}>
                {cv.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillChip}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {cv.languages.length > 0 && (
            <View>
              <Text style={[styles.sidebarSectionTitle, { color: accent }]}>{label('languages')}</Text>
              {cv.languages.map((lang) => (
                <View key={lang.id} style={styles.langItem}>
                  <Text style={styles.langName}>{lang.language}</Text>
                  <Text style={styles.langLevel}>
                    {isMotherTongueLanguage(lang) ? 'Mother tongue' : getOverallLevel(lang)}
                  </Text>
                </View>
              ))}
              <Text style={styles.langNote}>Levels: A1/A2: Basic - B1/B2: Independent - C1/C2: Proficient (CEFR)</Text>
            </View>
          )}
        </View>

        {/* Main content — flows naturally on the left */}
        <View style={styles.main}>
          <View>
            <Text style={[styles.sectionTitle, { color: ink, borderBottomColor: accent }]}>{label('profile')}</Text>
            <Text style={styles.paragraph}>{cv.profile.summary}</Text>
          </View>

          {orderedMain.map((key) => {
              if (key === 'experience' && cv.experiences.length > 0) return (
                <View key="experience" break={cv.pageBreaks.includes('experience')}>
                  <Text style={[styles.sectionTitle, { color: ink, borderBottomColor: accent }]}>{label('experience')}</Text>
                  {cv.experiences.map((exp) => (
                    <View key={exp.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.entryRole, { color: ink }]}>{exp.role}</Text>
                          <Text style={[styles.entryCompany, { color: muted }]}>{exp.company}</Text>
                        </View>
                        <Text style={[styles.entryPeriod, { color: muted }]}>{exp.period}</Text>
                      </View>
                      <View style={styles.bulletList}>
                        {exp.highlights.map((h, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <Text style={[styles.bulletDot, { color: muted }]}>•</Text>
                            <Text style={styles.bulletText}>{h}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )
              if (key === 'projects' && cv.projects.length > 0) return (
                <View key="projects" break={cv.pageBreaks.includes('projects')}>
                  <Text style={[styles.sectionTitle, { color: ink, borderBottomColor: accent }]}>{label('projects')}</Text>
                  {cv.projects.map((project) => (
                    <View key={project.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <Text style={[styles.entryRole, { color: ink }]}>{project.name}</Text>
                        <Text style={[styles.entryPeriod, styles.projectStack]}>{project.stack}</Text>
                      </View>
                      <Text style={styles.projectDesc}>{project.description}</Text>
                    </View>
                  ))}
                </View>
              )
              if (key === 'education' && cv.education.length > 0) return (
                <View key="education" break={cv.pageBreaks.includes('education')}>
                  <Text style={[styles.sectionTitle, { color: ink, borderBottomColor: accent }]}>{label('education')}</Text>
                  {cv.education.map((edu) => (
                    <View key={edu.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.entryRole, { color: ink }]}>{edu.degree}</Text>
                          <Text style={[styles.entryCompany, { color: muted }]}>{edu.institution}</Text>
                        </View>
                        <Text style={[styles.entryPeriod, { color: muted }]}>{edu.period}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
              const custom = cv.customSections.find((s) => s.id === key)
              if (custom) return (
                <View key={key} break={cv.pageBreaks.includes(key)}>
                  <Text style={[styles.sectionTitle, { color: ink, borderBottomColor: accent }]}>{custom.title}</Text>
                  {custom.bullets.filter(Boolean).map((b, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={[styles.bulletDot, { color: muted }]}>{'\u2022'}</Text>
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              )
              return null
          })}
        </View>
      </Page>
    </Document>
  )
}
