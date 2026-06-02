export type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  website: string;
  summary: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  highlights: string[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  stack: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  period: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type Language = {
  id: string;
  language: string;
  proficiency?: string; // legacy fallback
  listening?: string;
  reading?: string;
  dialog?: string;
  reproduce?: string;
  writing?: string;
  motherTongue?: boolean;
};

export type CustomSection = {
  id: string;
  title: string;
  bullets: string[];
};

export type CvLocale = 'en' | 'ro';

// ── Per-template CV shapes (discriminated union) ─────────────────────────────

export type ClassicCvData = {
  kind: 'classic';
  locale: CvLocale;
  profile: Profile;
  skills: string[];
  languages: Language[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  customSections: CustomSection[];
  pageBreaks: string[];
  sectionOrder: string[];
  colors: Record<string, string>;
  sectionLabels: Record<string, string>;
};

export type ModernCvData = {
  kind: 'modern';
  locale: CvLocale;
  profile: Profile;
  skills: string[];
  languages: Language[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  customSections: CustomSection[];
  pageBreaks: string[];
  sectionOrder: string[];
  colors: Record<string, string>;
  sectionLabels: Record<string, string>;
};

export type ExecutiveCvData = {
  kind: 'executive';
  locale: CvLocale;
  profile: Profile;
  languages: Language[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  customSections: CustomSection[];
  pageBreaks: string[];
  sectionOrder: string[];
  colors: Record<string, string>;
  sectionLabels: Record<string, string>;
};

export type CompactCvData = {
  kind: 'compact';
  locale: CvLocale;
  profile: Profile;
  skills: string[];
  languages: Language[];
  experiences: Experience[];
  education: Education[];
  customSections: CustomSection[];
  pageBreaks: string[];
  sectionOrder: string[];
  colors: Record<string, string>;
  sectionLabels: Record<string, string>;
};

export type CvData = ClassicCvData | ModernCvData | ExecutiveCvData | CompactCvData;

// ── Full store: superset of all template fields ───────────────────────────────

export type FullCvData = {
  profile: Profile;
  skills: string[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
};

export type LocalizedProfileData = {
  data: FullCvData
  sectionLabels: Record<string, string>
}

export type CvProfile = {
  id: string
  name: string
  templateId: string
  locale: CvLocale
  localized: Record<CvLocale, LocalizedProfileData>
  hiddenSections: string[]
  pageBreaks: string[]
  sectionOrder: string[]
  colors: Record<string, string>
  createdAt: number
  updatedAt: number
}

export function projectCv(
  full: FullCvData,
  templateId: string,
  hiddenSections: string[] = [],
  pageBreaks: string[] = [],
  sectionOrder: string[] = [],
  colors: Record<string, string> = {},
  locale: CvLocale = 'en',
  sectionLabels: Record<string, string> = {},
): CvData {
  const hide = new Set(hiddenSections)
  const customSections = (full.customSections ?? []).filter((s) => !hide.has(s.id))
  switch (templateId) {
    case 'modern':
      return { kind: 'modern', locale, profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'executive':
      return { kind: 'executive', locale, profile: full.profile, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, certifications: hide.has('certifications') ? [] : full.certifications, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'compact':
      return { kind: 'compact', locale, profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    default:
      return { kind: 'classic', locale, profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
  }
}

export function makeDefaultFullCv(locale: CvLocale = 'en'): FullCvData {
  if (locale === 'ro') {
    return {
      profile: {
        name: 'Ioana Popescu',
        title: 'Inginer Software Senior',
        location: 'Bucuresti, Romania',
        email: 'test@example.com',
        website: 'portfolio.example',
        summary:
          'Inginer orientat spre produs, cu experienta in aplicatii web fiabile, optimizare de performanta si scalarea sistemelor UI partajate.',
      },
      skills: [
        'React',
        'TypeScript',
        'TanStack',
        'Node.js',
        'GraphQL',
        'CI/CD',
        'Performanta Web',
        'Sisteme de Design',
        'Testare E2E',
      ],
      experiences: [
        {
          id: crypto.randomUUID(),
          company: 'Product Studio Co.',
          role: 'Lead Engineer',
          period: '2022 - Prezent',
          highlights: [
            'Am coordonat migrarea dintr-o aplicatie legacy SPA catre o arhitectura React modulara.',
            'Am implementat fluxuri de export PDF pentru documente generate de utilizatori.',
            'Am crescut increderea in release prin introducerea testarii automate UI si de integrare.',
          ],
        },
        {
          id: crypto.randomUUID(),
          company: 'Data Platform Inc.',
          role: 'Senior Frontend Engineer',
          period: '2019 - 2022',
          highlights: [
            'Am construit module reutilizabile de dashboard folosite de mai multe echipe de produs.',
            'Am introdus tokeni de design si verificari de accesibilitate in workflow-ul de dezvoltare.',
            'Am colaborat cu echipele de produs pentru a imbunatati onboarding-ul si retentia.',
          ],
        },
      ],
      projects: [
        {
          id: crypto.randomUUID(),
          name: 'Document Builder',
          description: 'Aplicatie web pentru creare de documente structurate cu preview live si export.',
          stack: 'React, TypeScript, PDF Rendering',
        },
        {
          id: crypto.randomUUID(),
          name: 'Analytics Dashboard',
          description: 'Dashboard de performanta si engagement cu vizualizari pe roluri.',
          stack: 'React, API-uri, SQL',
        },
      ],
      education: [
        {
          id: crypto.randomUUID(),
          degree: 'Master, Interactiune Om-Calculator',
          institution: 'Universitate de Stat',
          period: '2014 - 2016',
        },
        {
          id: crypto.randomUUID(),
          degree: 'Licenta, Informatica',
          institution: 'Institutul de Tehnologie',
          period: '2011 - 2014',
        },
      ],
      certifications: [
        {
          id: crypto.randomUUID(),
          name: 'Certificare Arhitectura Cloud',
          issuer: 'Furnizor Acreditat de Training',
          year: '2023',
        },
      ],
      languages: [
        {
          id: crypto.randomUUID(),
          language: 'Romana',
          listening: 'C2',
          reading: 'C2',
          dialog: 'C2',
          reproduce: 'C2',
          writing: 'C2',
        },
        {
          id: crypto.randomUUID(),
          language: 'Engleza',
          listening: 'C1',
          reading: 'C1',
          dialog: 'C1',
          reproduce: 'C1',
          writing: 'C1',
        },
      ],
      customSections: [],
    }
  }

  return {
    profile: {
      name: 'Jane Doe',
      title: 'Senior Software Engineer',
      location: 'Remote',
      email: 'test@example.com',
      website: 'portfolio.example',
      summary:
        'Product-focused engineer with experience building reliable web applications, improving performance, and scaling shared UI systems.',
    },
    skills: [
      'React',
      'TypeScript',
      'TanStack',
      'Node.js',
      'GraphQL',
      'CI/CD',
      'Web Performance',
      'Design Systems',
      'E2E Testing',
    ],
    experiences: [
      {
        id: crypto.randomUUID(),
        company: 'Product Studio Co.',
        role: 'Lead Engineer',
        period: '2022 - Present',
        highlights: [
          'Led migration from a legacy single-page app to a modular React architecture.',
          'Implemented PDF export workflows for user-generated documents.',
          'Improved release confidence by introducing automated UI and integration testing.',
        ],
      },
      {
        id: crypto.randomUUID(),
        company: 'Data Platform Inc.',
        role: 'Senior Frontend Engineer',
        period: '2019 - 2022',
        highlights: [
          'Built reusable dashboard modules used across multiple product teams.',
          'Introduced design tokens and accessibility checks into the development workflow.',
          'Collaborated with product teams to improve onboarding conversion and retention.',
        ],
      },
    ],
    projects: [
      {
        id: crypto.randomUUID(),
        name: 'Document Builder',
        description: 'Web app for creating structured documents with live preview and export.',
        stack: 'React, TypeScript, PDF Rendering',
      },
      {
        id: crypto.randomUUID(),
        name: 'Analytics Dashboard',
        description: 'Performance and engagement dashboard with role-based views.',
        stack: 'React, APIs, SQL',
      },
    ],
    education: [
      {
        id: crypto.randomUUID(),
        degree: 'MSc, Human-Computer Interaction',
        institution: 'State University',
        period: '2014 - 2016',
      },
      {
        id: crypto.randomUUID(),
        degree: 'BSc, Computer Science',
        institution: 'Institute of Technology',
        period: '2011 - 2014',
      },
    ],
    certifications: [
      {
        id: crypto.randomUUID(),
        name: 'Cloud Architecture Certification',
        issuer: 'Accredited Training Provider',
        year: '2023',
      },
    ],
    languages: [
      {
        id: crypto.randomUUID(),
        language: 'English',
        listening: 'C2',
        reading: 'C2',
        dialog: 'C2',
        reproduce: 'C2',
        writing: 'C2',
      },
      {
        id: crypto.randomUUID(),
        language: 'Romanian',
        listening: 'C1',
        reading: 'C1',
        dialog: 'C1',
        reproduce: 'C1',
        writing: 'C1',
      },
    ],
    customSections: [],
  }
}

export const DEFAULT_FULL_CV: FullCvData = makeDefaultFullCv('en')

const DEFAULT_SECTION_LABELS: Record<CvLocale, Record<string, Record<string, string>>> = {
  en: {
    classic: {
      profile: 'Profile',
      skills: 'Core Skills',
      experience: 'Experience',
      projects: 'Selected Projects',
      education: 'Education',
      languages: 'Languages',
    },
    modern: {
      profile: 'Profile',
      contact: 'Contact',
      skills: 'Skills',
      experience: 'Experience',
      projects: 'Selected Projects',
      education: 'Education',
      languages: 'Languages',
    },
    executive: {
      profile: 'Executive Summary',
      experience: 'Professional Experience',
      education: 'Education',
      certifications: 'Certifications',
      languages: 'Languages',
    },
    compact: {
      about: 'About',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
      languages: 'Languages',
    },
  },
  ro: {
    classic: {
      profile: 'Profil',
      skills: 'Competente cheie',
      experience: 'Experienta',
      projects: 'Proiecte selectate',
      education: 'Educatie',
      languages: 'Limbi',
    },
    modern: {
      profile: 'Profil',
      contact: 'Contact',
      skills: 'Competente',
      experience: 'Experienta',
      projects: 'Proiecte selectate',
      education: 'Educatie',
      languages: 'Limbi',
    },
    executive: {
      profile: 'Rezumat executiv',
      experience: 'Experienta profesionala',
      education: 'Educatie',
      certifications: 'Certificari',
      languages: 'Limbi',
    },
    compact: {
      about: 'Despre',
      skills: 'Competente',
      experience: 'Experienta',
      education: 'Educatie',
      languages: 'Limbi',
    },
  },
}

export function getDefaultSectionLabelsForTemplate(templateId: string, locale: CvLocale): Record<string, string> {
  return DEFAULT_SECTION_LABELS[locale][templateId] ?? DEFAULT_SECTION_LABELS.en.classic
}

export function getDefaultSectionLabel(templateId: string, sectionKey: string, locale: CvLocale): string {
  return getDefaultSectionLabelsForTemplate(templateId, locale)[sectionKey] ?? sectionKey
}
