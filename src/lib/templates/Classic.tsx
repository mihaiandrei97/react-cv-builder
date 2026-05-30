import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ClassicCvData } from '../types'
import '../fonts'

const PAPER = '#fcfcf8'
const INK = '#222222'
const MUTED = '#5d5d55'
const LINE = '#d4d0c4'
const ACCENT = '#c06b31'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Source Serif 4',
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

export function ClassicDocument({ cv }: { cv: ClassicCvData }) {
  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Curriculum Vitae</Text>
            <Text style={styles.heroName}>{cv.profile.name}</Text>
            <Text style={styles.heroRole}>{cv.profile.title}</Text>
          </View>
          <View style={styles.contactList}>
            <Text style={styles.contactItem}>{cv.profile.location}</Text>
            <Text style={styles.contactItem}>{cv.profile.email}</Text>
            <Text style={styles.contactItem}>{cv.profile.website}</Text>
          </View>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.paragraph}>{cv.profile.summary}</Text>
        </View>

        {/* Skills */}
        {cv.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Skills</Text>
            <View style={styles.skillGrid}>
              {cv.skills.map((skill, i) => (
                <Text key={i} style={styles.skillItem}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {cv.experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {cv.experiences.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>
                    {exp.role} – {exp.company}
                  </Text>
                  <Text style={styles.experiencePeriod}>{exp.period}</Text>
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
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        {/* Projects */}
        {cv.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Projects</Text>
            {cv.projects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDesc}>{project.description}</Text>
                <Text style={styles.projectStack}>{project.stack}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {cv.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((edu) => (
              <View key={edu.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{edu.degree}</Text>
                  <Text style={styles.experiencePeriod}>{edu.period}</Text>
                </View>
                <Text style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
