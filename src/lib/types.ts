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

export type CvData = {
  profile: Profile;
  skills: string[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
};

export const DEFAULT_CV: CvData = {
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
};
