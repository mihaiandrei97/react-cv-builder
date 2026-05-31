import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { CompactCvData } from '../types'
import '../fonts'

const PAPER = '#ffffff'
const INK = '#111111'
const MUTED = '#606060'
const LINE = '#e0ddd4'
const ACCENT = '#1a5c8a'
const ACCENT_LIGHT = '#e8f2f9'

export const COLOR_SLOTS = [
  { key: 'accent', label: 'Accent', default: ACCENT },
]

const COL_LEFT = '34%'
const COL_RIGHT = '66%'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Source Serif 4',
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
  langBadge: {
    fontSize: 7,
    color: ACCENT,
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 2,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 4,
    paddingRight: 4,
    alignSelf: 'flex-start',
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
  const accentLight = accent === ACCENT ? ACCENT_LIGHT : accent + '22'

  return (
    <Document key={JSON.stringify(cv.colors)}>
      <Page size="A4" style={styles.page}>
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
              <Text style={[styles.sideSectionTitle, { color: accent }]}>About</Text>
              <Text style={styles.summary}>{cv.profile.summary}</Text>
            </View>

            {/* Skills */}
            {cv.skills.length > 0 && (
              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionTitle, { color: accent }]}>Skills</Text>
                {cv.skills.map((skill, i) => (
                  <View key={i} style={styles.skillRow}>
                    <Text style={styles.skillLabel}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {cv.languages.length > 0 && (
              <View style={styles.sideSection}>
                <Text style={[styles.sideSectionTitle, { color: accent }]}>Languages</Text>
                {cv.languages.map((lang) => (
                  <View key={lang.id} style={styles.langItem}>
                    <Text style={styles.langName}>{lang.language}</Text>
                    <Text style={[styles.langBadge, { color: accent, backgroundColor: accentLight }]}>{lang.proficiency}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right column */}
          <View style={styles.rightCol}>
            {/* Experience */}
            {cv.experiences.length > 0 && (
              <View style={styles.mainSection}>
                <Text style={styles.mainSectionTitle}>Experience</Text>
                {cv.experiences.map((exp) => (
                  <View key={exp.id} style={styles.expItem}>
                    <View style={styles.expHeader}>
                      <Text style={styles.expRole}>{exp.role}</Text>
                      <Text style={styles.expPeriod}>{exp.period}</Text>
                    </View>
                    <Text style={[styles.expCompany, { color: accent }]}>{exp.company}</Text>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>·</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {cv.education.length > 0 && (
              <View style={styles.mainSection}>
                <Text style={styles.mainSectionTitle}>Education</Text>
                {cv.education.map((edu) => (
                  <View key={edu.id} style={styles.eduItem}>
                    <View style={styles.eduHeader}>
                      <Text style={styles.eduDegree}>{edu.degree}</Text>
                      <Text style={styles.eduPeriod}>{edu.period}</Text>
                    </View>
                    <Text style={styles.eduInstitution}>{edu.institution}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
