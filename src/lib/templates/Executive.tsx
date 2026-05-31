import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ExecutiveCvData } from '../types'
import '../fonts'

const PAPER = '#fafaf7'
const INK = '#1a1a18'
const MUTED = '#5a5a52'
const LINE = '#ccc9bc'
const ACCENT = '#8b3a1e'

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
    paddingTop: '16mm',
    paddingBottom: '16mm',
    paddingLeft: '18mm',
    paddingRight: '18mm',
  },

  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 10,
    marginBottom: 14,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.5,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 8,
    fontWeight: 400,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
    fontSize: 8.5,
    color: MUTED,
  },

  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: ACCENT,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: INK,
  },

  // Experience
  expItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  expRole: {
    fontSize: 11,
    fontWeight: 700,
  },
  expPeriod: {
    fontSize: 8.5,
    color: MUTED,
    flexShrink: 0,
    marginLeft: 8,
    marginTop: 1,
  },
  expCompany: {
    fontSize: 9,
    color: ACCENT,
    marginBottom: 4,
    fontWeight: 600,
  },
  bulletList: {
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  bulletDot: {
    fontSize: 9,
    marginRight: 6,
    color: MUTED,
    width: 8,
    marginTop: 0.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: INK,
  },

  // Education — two columns
  eduGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eduItem: {
    width: '48%',
  },
  eduDegree: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 1,
  },
  eduInstitution: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 1,
  },
  eduPeriod: {
    fontSize: 8.5,
    color: MUTED,
    fontStyle: 'italic',
  },

  // Certifications — inline pills
  certRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  certItem: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 2,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#f4f2ec',
  },
  certName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
  },
  certMeta: {
    fontSize: 7.5,
    color: MUTED,
  },
})

export function ExecutiveDocument({ cv }: { cv: ExecutiveCvData }) {
  const accent = cv.colors.accent ?? ACCENT
  const paper = cv.colors.paper ?? PAPER

  const ordered = ['experience', 'education', 'certifications'].sort(
    (a, b) => cv.sectionOrder.indexOf(a) - cv.sectionOrder.indexOf(b)
  )

  return (
    <Document key={cv.sectionOrder.join(',') + JSON.stringify(cv.colors)}>
      <Page size="A4" style={[styles.page, { backgroundColor: paper }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <Text style={styles.name}>{cv.profile.name}</Text>
          <Text style={styles.title}>{cv.profile.title}</Text>
          <View style={styles.contactRow}>
            <Text>{cv.profile.location}</Text>
            <Text>·</Text>
            <Text>{cv.profile.email}</Text>
            <Text>·</Text>
            <Text>{cv.profile.website}</Text>
          </View>
        </View>

        {/* Profile — always first */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: accent }]}>{cv.sectionLabels.profile ?? 'Executive Summary'}</Text>
          <Text style={styles.paragraph}>{cv.profile.summary}</Text>
        </View>

        {ordered.map((key) => {
          if (key === 'experience' && cv.experiences.length > 0) return (
            <View key="experience" style={styles.section} break={cv.pageBreaks.includes('experience')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{cv.sectionLabels.experience ?? 'Professional Experience'}</Text>
              {cv.experiences.map((exp) => (
                <View key={exp.id} style={styles.expItem}>
                  <View style={styles.expHeader}>
                    <Text style={styles.expRole}>{exp.role}</Text>
                    <Text style={styles.expPeriod}>{exp.period}</Text>
                  </View>
                <Text style={[styles.expCompany, { color: accent }]}>{exp.company}</Text>
                  <View style={styles.bulletList}>
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>–</Text>
                        <Text style={styles.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )
          if (key === 'education' && cv.education.length > 0) return (
            <View key="education" style={styles.section} break={cv.pageBreaks.includes('education')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{cv.sectionLabels.education ?? 'Education'}</Text>
              <View style={styles.eduGrid}>
                {cv.education.map((edu) => (
                  <View key={edu.id} style={styles.eduItem}>
                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                    <Text style={styles.eduInstitution}>{edu.institution}</Text>
                    <Text style={styles.eduPeriod}>{edu.period}</Text>
                  </View>
                ))}
              </View>
            </View>
          )
          if (key === 'certifications' && cv.certifications.length > 0) return (
            <View key="certifications" style={styles.section} break={cv.pageBreaks.includes('certifications')}>
              <Text style={[styles.sectionTitle, { color: accent }]}>{cv.sectionLabels.certifications ?? 'Certifications'}</Text>
              <View style={styles.certRow}>
                {cv.certifications.map((cert) => (
                  <View key={cert.id} style={styles.certItem}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    <Text style={styles.certMeta}>{cert.issuer} · {cert.year}</Text>
                  </View>
                ))}
              </View>
            </View>
          )
          return null
        })}
      </Page>
    </Document>
  )
}
