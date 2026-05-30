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

const SIDEBAR_WIDTH = '36%'
const MAIN_WIDTH = '64%'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontSize: 10,
    backgroundColor: MAIN_BG,
  },

  // Sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: SIDEBAR_BG,
    paddingTop: '14mm',
    paddingBottom: '14mm',
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

  // Main content
  main: {
    width: MAIN_WIDTH,
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
  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View>
            <Text style={styles.sidebarName}>{cv.profile.name}</Text>
            <Text style={styles.sidebarTitle}>{cv.profile.title}</Text>
          </View>

          <View>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
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
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
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

        {/* Main */}
        <View style={styles.main}>
          <View>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text style={styles.paragraph}>{cv.profile.summary}</Text>
          </View>

          {cv.experiences.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Experience</Text>
              {cv.experiences.map((exp) => (
                <View key={exp.id} style={styles.entry}>
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
          )}
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        {/* Sidebar continuation (empty dark column) */}
        <View style={[styles.sidebar, { gap: 0 }]} />

        {/* Main */}
        <View style={styles.main}>
          {cv.projects.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Selected Projects</Text>
              {cv.projects.map((project) => (
                <View key={project.id} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryRole}>{project.name}</Text>
                    <Text style={[styles.entryPeriod, styles.projectStack]}>{project.stack}</Text>
                  </View>
                  <Text style={styles.projectDesc}>{project.description}</Text>
                </View>
              ))}
            </View>
          )}

          {cv.education.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Education</Text>
              {cv.education.map((edu) => (
                <View key={edu.id} style={styles.entry}>
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
          )}
        </View>
      </Page>
    </Document>
  )
}
