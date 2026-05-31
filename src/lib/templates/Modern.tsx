import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ModernCvData } from '../types'

// Modern uses Helvetica (react-pdf built-in sans-serif)
const SIDEBAR_BG = '#1e2b3c'
const SIDEBAR_ACCENT = '#7dd3fc'
const SIDEBAR_MUTED = '#64748b'
const SIDEBAR_CHIP_BG = '#2d3f54'
const SIDEBAR_CHIP_BORDER = '#3b5268'
const SIDEBAR_CHIP_TEXT = '#bfdbfe'
const SIDEBAR_DIVIDER = '#2d3f54'
const MAIN_BG = '#ffffff'
const MAIN_INK = '#0f172a'
const MAIN_BODY = '#334155'
const MAIN_MUTED = '#64748b'
const MAIN_ACCENT = '#0ea5e9'

export const COLOR_SLOTS = [
  { key: 'sidebarBg', label: 'Sidebar', default: SIDEBAR_BG },
  { key: 'sidebarAccent', label: 'Sidebar Accent', default: SIDEBAR_ACCENT },
  { key: 'accent', label: 'Accent', default: MAIN_ACCENT },
]

const SIDEBAR_WIDTH = '36%'
const MAIN_WIDTH = '64%'

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    backgroundColor: MAIN_BG,
  },

  // Sidebar background – fixed so it repeats on every overflow page
  sidebarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: SIDEBAR_BG,
  },

  // Sidebar content – absolutely positioned, appears on page 1 only
  sidebar: {
    position: 'absolute',
    top: '14mm',
    left: 0,
    width: SIDEBAR_WIDTH,
    paddingLeft: '10mm',
    paddingRight: '10mm',
    flexDirection: 'column',
    gap: 14,
  },
  sidebarName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: 3,
  },
  sidebarTitle: {
    fontSize: 8,
    color: SIDEBAR_ACCENT,
    fontWeight: 400,
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  sidebarSectionTitle: {
    fontSize: 6.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: SIDEBAR_ACCENT,
    borderBottomWidth: 1,
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
    color: '#cbd5e1',
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
    borderWidth: 1,
    borderColor: SIDEBAR_CHIP_BORDER,
    borderRadius: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    marginBottom: 2,
  },

  // Main content – flows naturally; marginLeft reserves space for sidebar
  main: {
    marginLeft: SIDEBAR_WIDTH,
    paddingTop: '14mm',
    paddingBottom: '14mm',
    paddingLeft: '11mm',
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
    borderBottomWidth: 2,
    borderBottomColor: MAIN_ACCENT,
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
    color: '#94a3b8',
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
    color: MAIN_ACCENT,
  },
  projectDesc: {
    fontSize: 8,
    lineHeight: 1.45,
    color: MAIN_BODY,
    marginTop: 2,
    marginBottom: 2,
  },
})

export function ModernDocument({ cv }: { cv: ModernCvData }) {
  const sidebarBg = cv.colors.sidebarBg ?? SIDEBAR_BG
  const sidebarAccent = cv.colors.sidebarAccent ?? SIDEBAR_ACCENT
  const accent = cv.colors.accent ?? MAIN_ACCENT

  return (
    <Document key={cv.sectionOrder.join(',') + JSON.stringify(cv.colors)}>
      <Page size="A4" style={styles.page}>
        {/* Dark sidebar background — fixed so it appears on every overflow page */}
        <View style={[styles.sidebarBg, { backgroundColor: sidebarBg }]} fixed />

        {/* Sidebar content — not fixed, so only renders on page 1 */}
        <View style={styles.sidebar}>
          <View>
            <Text style={styles.sidebarName}>{cv.profile.name}</Text>
            <Text style={[styles.sidebarTitle, { color: sidebarAccent }]}>{cv.profile.title}</Text>
          </View>

          <View>
            <Text style={[styles.sidebarSectionTitle, { color: sidebarAccent }]}>{cv.sectionLabels.contact ?? 'Contact'}</Text>
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
              <Text style={[styles.sidebarSectionTitle, { color: sidebarAccent }]}>{cv.sectionLabels.skills ?? 'Skills'}</Text>
              <View style={styles.skillsWrap}>
                {cv.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillChip}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main content — all sections together, auto-flows to page 2 if needed */}
        <View style={styles.main}>
          <View>
            <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.profile ?? 'Profile'}</Text>
            <Text style={styles.paragraph}>{cv.profile.summary}</Text>
          </View>

          {['experience', 'projects', 'education']
            .sort((a, b) => cv.sectionOrder.indexOf(a) - cv.sectionOrder.indexOf(b))
            .map((key) => {
              if (key === 'experience' && cv.experiences.length > 0) return (
                <View key="experience" break={cv.pageBreaks.includes('experience')}>
                  <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.experience ?? 'Experience'}</Text>
                  {cv.experiences.map((exp) => (
                    <View key={exp.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.entryRole}>{exp.role}</Text>
                          <Text style={styles.entryCompany}>{exp.company}</Text>
                        </View>
                        <Text style={styles.entryPeriod}>{exp.period}</Text>
                      </View>
                      <View style={styles.bulletList}>
                        {exp.highlights.map((h, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
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
                  <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.projects ?? 'Selected Projects'}</Text>
                  {cv.projects.map((project) => (
                    <View key={project.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <Text style={styles.entryRole}>{project.name}</Text>
                        <Text style={[styles.entryPeriod, styles.projectStack]}>{project.stack}</Text>
                      </View>
                      <Text style={styles.projectDesc}>{project.description}</Text>
                    </View>
                  ))}
                </View>
              )
              if (key === 'education' && cv.education.length > 0) return (
                <View key="education" break={cv.pageBreaks.includes('education')}>
                  <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.education ?? 'Education'}</Text>
                  {cv.education.map((edu) => (
                    <View key={edu.id} style={styles.entry} wrap={false}>
                      <View style={styles.entryHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.entryRole}>{edu.degree}</Text>
                          <Text style={styles.entryCompany}>{edu.institution}</Text>
                        </View>
                        <Text style={styles.entryPeriod}>{edu.period}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
              return null
            })
          }
        </View>
      </Page>
    </Document>
  )
}
