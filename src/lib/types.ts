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

// ── Per-template CV shapes (discriminated union) ─────────────────────────────

export type ClassicCvData = {
  kind: 'classic';
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

export type CvProfile = {
  id: string
  name: string
  templateId: string
  data: FullCvData
  hiddenSections: string[]
  pageBreaks: string[]
  sectionOrder: string[]
  colors: Record<string, string>
  sectionLabels: Record<string, string>
  createdAt: number
  updatedAt: number
}

export function projectCv(full: FullCvData, templateId: string, hiddenSections: string[] = [], pageBreaks: string[] = [], sectionOrder: string[] = [], colors: Record<string, string> = {}, sectionLabels: Record<string, string> = {}): CvData {
  const hide = new Set(hiddenSections)
  const customSections = (full.customSections ?? []).filter((s) => !hide.has(s.id))
  switch (templateId) {
    case 'modern':
      return { kind: 'modern', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'executive':
      return { kind: 'executive', profile: full.profile, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, certifications: hide.has('certifications') ? [] : full.certifications, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'compact':
      return { kind: 'compact', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    default:
      return { kind: 'classic', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
  }
}

export const DEFAULT_FULL_CV: FullCvData = {
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
    {
      id: crypto.randomUUID(),
      company: 'Web Solutions Group',
      role: 'Frontend Engineer',
      period: '2016 - 2019',
      highlights: [
        'Created a shared component library with documentation for cross-team usage.',
        'Refactored reporting pages and significantly reduced load times.',
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
    {
      id: crypto.randomUUID(),
      name: 'UI Component Library',
      description: 'Reusable UI kit with visual regression checks and usage guidelines.',
      stack: 'TypeScript, Storybook, Testing',
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
    {
      id: crypto.randomUUID(),
      name: 'Agile Project Management Certification',
      issuer: 'Professional Certification Institute',
      year: '2021',
    },
  ],
  languages: [
    {
      id: crypto.randomUUID(),
      language: 'English',
      listening: 'A1',
      reading: 'A1',
      dialog: 'A1',
      reproduce: 'A1',
      writing: 'A1',
    },
    {
      id: crypto.randomUUID(),
      language: 'Spanish',
      listening: 'A2',
      reading: 'A2',
      dialog: 'A2',
      reproduce: 'A2',
      writing: 'A2',
    },
    {
      id: crypto.randomUUID(),
      language: 'German',
      listening: 'B1',
      reading: 'B1',
      dialog: 'B1',
      reproduce: 'B1',
      writing: 'B1',
    },
  ],
  customSections: [],
};
