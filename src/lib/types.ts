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
  proficiency: string;
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
      return { kind: 'modern', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'executive':
      return { kind: 'executive', profile: full.profile, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, certifications: hide.has('certifications') ? [] : full.certifications, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    case 'compact':
      return { kind: 'compact', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, languages: hide.has('languages') ? [] : full.languages, experiences: hide.has('experience') ? [] : full.experiences, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
    default:
      return { kind: 'classic', profile: full.profile, skills: hide.has('skills') ? [] : full.skills, experiences: hide.has('experience') ? [] : full.experiences, projects: hide.has('projects') ? [] : full.projects, education: hide.has('education') ? [] : full.education, customSections, pageBreaks, sectionOrder, colors, sectionLabels };
  }
}

export const DEFAULT_FULL_CV: FullCvData = {
  profile: {
    name: 'Mihai Example',
    title: 'Senior Frontend Engineer',
    location: 'Bucharest, Romania',
    email: 'mihai@example.com',
    website: 'mihai.dev',
    summary:
      'Frontend engineer focused on product-led interfaces, resilient architecture, and design systems that scale across teams.',
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
  ],
  experiences: [
    {
      id: crypto.randomUUID(),
      company: 'Northstar Products',
      role: 'Lead Frontend Engineer',
      period: '2022 - Present',
      highlights: [
        'Led migration from monolithic SPA to React app with route-level performance budgets.',
        'Built a print-first resume engine that exports deterministic A4 PDFs with react-pdf.',
        'Reduced regression issues by 47% by introducing visual tests and shared component contracts.',
      ],
    },
    {
      id: crypto.randomUUID(),
      company: 'Atlas Labs',
      role: 'Senior UI Engineer',
      period: '2019 - 2022',
      highlights: [
        'Created reusable dashboard modules used by four internal products and two white-label clients.',
        'Introduced a token-driven theming architecture and accessibility checklist into CI.',
        'Collaborated with product and content teams to optimize onboarding funnel by 18%.',
      ],
    },
    {
      id: crypto.randomUUID(),
      company: 'Blue Orbit',
      role: 'Frontend Engineer',
      period: '2016 - 2019',
      highlights: [
        'Shipped a component library with robust docs and reduced duplicate UI implementations.',
        'Refactored legacy reporting pages and cut average load times from 4.2s to 1.6s.',
      ],
    },
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: 'CV Pipeline',
      description: 'React-based CV builder with react-pdf generation and template switching.',
      stack: 'React, TanStack Router, react-pdf, TypeScript',
    },
    {
      id: crypto.randomUUID(),
      name: 'Launchboard',
      description: 'Growth analytics dashboard with collaborative annotations and audit logs.',
      stack: 'React, GraphQL, PostgreSQL',
    },
    {
      id: crypto.randomUUID(),
      name: 'Atlas UI',
      description: 'Multi-brand component system with automatic visual testing in CI.',
      stack: 'TypeScript, Storybook, Playwright',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      degree: 'MSc, Human Computer Interaction',
      institution: 'University of Bucharest',
      period: '2014 - 2016',
    },
    {
      id: crypto.randomUUID(),
      degree: 'BSc, Computer Science',
      institution: 'Politehnica University of Bucharest',
      period: '2011 - 2014',
    },
  ],
  certifications: [
    {
      id: crypto.randomUUID(),
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      year: '2023',
    },
    {
      id: crypto.randomUUID(),
      name: 'Professional Scrum Master I',
      issuer: 'Scrum.org',
      year: '2021',
    },
  ],
  languages: [
    { id: crypto.randomUUID(), language: 'English', proficiency: 'Fluent' },
    { id: crypto.randomUUID(), language: 'Romanian', proficiency: 'Native' },
    { id: crypto.randomUUID(), language: 'French', proficiency: 'Intermediate' },
  ],
  customSections: [],
};
