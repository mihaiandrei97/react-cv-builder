import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ClassicCvData } from '../types'
import '../fonts'
import { getLanguageLevel } from './language-level'

const PAPER = '#fcfcf8'
const INK = '#222222'
const MUTED = '#5d5d55'
const LINE = '#d4d0c4'
const ACCENT = '#c06b31'

export const COLOR_SLOTS = [
  { key: 'accent', label: 'Accent', default: ACCENT },
  { key: 'paper', label: 'Background', default: PAPER },
]

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

export function ClassicDocument({ cv }: { cv: ClassicCvData }) {
  const accent = cv.colors.accent ?? ACCENT
  const paper = cv.colors.paper ?? PAPER

  const customIds = cv.customSections.map((s) => s.id)
  const ordered = [...['skills', 'experience', 'projects', 'education', 'languages'], ...customIds].sort(
    (a, b) => {
      const ai = cv.sectionOrder.indexOf(a); const bi = cv.sectionOrder.indexOf(b)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    }
  )
  const motherTongue = cv.languages[0]
  const otherLanguages = cv.languages.slice(1)
  const motherTongueLabel = motherTongue?.language || 'Romanian'

  return (
    <Document key={cv.sectionOrder.join(',') + JSON.stringify(cv.colors)}>
      <Page size="A4" style={[styles.page, { backgroundColor: paper }]}>
        {/* Header */}
        <View style={[styles.hero, { borderBottomColor: accent }]}>
          <View>
            <Text style={[styles.heroName, { color: accent }]}>{cv.profile.name}</Text>
            <Text style={styles.heroRole}>{cv.profile.title}</Text>
          </View>
          <View style={styles.contactList}>
            <Text style={styles.contactItem}>{cv.profile.location}</Text>
            <Text style={styles.contactItem}>{cv.profile.email}</Text>
            <Text style={styles.contactItem}>{cv.profile.website}</Text>
          </View>
        </View>

        {/* Profile — always first */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.profile ?? 'Profile'}</Text>
          <Text style={styles.paragraph}>{cv.profile.summary}</Text>
        </View>

        {ordered.map((key) => {
          if (key === 'skills' && cv.skills.length > 0) return (
            <View key="skills" style={styles.section} break={cv.pageBreaks.includes('skills')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.skills ?? 'Core Skills'}</Text>
              <View style={styles.skillGrid}>
                {cv.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillItem}>{skill}</Text>
                ))}
              </View>
            </View>
          )
          if (key === 'experience' && cv.experiences.length > 0) return (
            <View key="experience" style={styles.section} break={cv.pageBreaks.includes('experience')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.experience ?? 'Experience'}</Text>
              {cv.experiences.map((exp) => (
                <View key={exp.id} style={styles.experienceItem} wrap={false}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{exp.role} – {exp.company}</Text>
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
          )
          if (key === 'projects' && cv.projects.length > 0) return (
            <View key="projects" style={styles.section} break={cv.pageBreaks.includes('projects')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.projects ?? 'Selected Projects'}</Text>
              {cv.projects.map((project) => (
                <View key={project.id} style={styles.projectItem} wrap={false}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDesc}>{project.description}</Text>
                  <Text style={styles.projectStack}>{project.stack}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'education' && cv.education.length > 0) return (
            <View key="education" style={styles.section} break={cv.pageBreaks.includes('education')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.education ?? 'Education'}</Text>
              {cv.education.map((edu) => (
                <View key={edu.id} style={styles.experienceItem} wrap={false}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{edu.degree}</Text>
                    <Text style={styles.experiencePeriod}>{edu.period}</Text>
                  </View>
                  <Text style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>{edu.institution}</Text>
                </View>
              ))}
            </View>
          )
          if (key === 'languages' && cv.languages.length > 0) return (
            <View key="languages" style={styles.section} break={cv.pageBreaks.includes('languages')}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{cv.sectionLabels.languages ?? 'Languages'}</Text>
              <View style={styles.langTable}>
                <View style={styles.langMotherRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName]}>Mother Tongue</Text>
                  <Text style={[styles.langCell, { width: '70%', borderRightWidth: 0 }]}>{motherTongueLabel}</Text>
                </View>
                <View style={styles.langGroupRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName]}>{''}</Text>
                  <Text style={[styles.langHeaderCell, styles.langColTwo]}>Understanding</Text>
                  <Text style={[styles.langHeaderCell, styles.langColTwo]}>Speaking</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { borderRightWidth: 0 }]}>Writing</Text>
                </View>
                <View style={styles.langSubHeaderRow}>
                  <Text style={[styles.langHeaderCell, styles.langColName]}>Other languages</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel]}>Listening</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel]}>Reading</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel]}>Dialog</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel]}>Reproduce</Text>
                  <Text style={[styles.langHeaderCell, styles.langColLevel, { borderRightWidth: 0 }]}>{''}</Text>
                </View>
                {otherLanguages.map((lang, i) => (
                  <View key={lang.id} style={i === otherLanguages.length - 1 ? [styles.langRow, { borderBottomWidth: 0 }] : styles.langRow}>
                    <Text style={[styles.langCell, styles.langColName]}>{lang.language}</Text>
                    <Text style={[styles.langCell, styles.langColLevel]}>{getLanguageLevel(lang, 'listening')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel]}>{getLanguageLevel(lang, 'reading')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel]}>{getLanguageLevel(lang, 'dialog')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel]}>{getLanguageLevel(lang, 'reproduce')}</Text>
                    <Text style={[styles.langCell, styles.langColLevel, { borderRightWidth: 0 }]}>{getLanguageLevel(lang, 'writing')}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.langNote}>Levels: A1/A2: Basic user - B1/B2: Independent user - C1/C2: Proficient user</Text>
              <Text style={styles.langNote}>Common European Framework of Reference for Language</Text>
            </View>
          )
          const custom = cv.customSections.find((s) => s.id === key)
          if (custom) return (
            <View key={key} style={styles.section} break={cv.pageBreaks.includes(key)}>
              <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>{custom.title}</Text>
              {custom.bullets.filter(Boolean).map((b, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>{'•'}</Text>
                  <Text style={styles.bulletText}>{b}</Text>
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
