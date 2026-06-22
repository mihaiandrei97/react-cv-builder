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

export type CvLocale = "en" | "ro";

// ── Per-template CV shapes (discriminated union) ─────────────────────────────

export type ClassicCvData = {
  kind: "classic";
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
  kind: "modern";
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
  kind: "executive";
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
  kind: "compact";
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

export type MinimalCvData = {
  kind: "minimal";
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

export type SidebarCvData = {
  kind: "sidebar";
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

export type TimelineCvData = {
  kind: "timeline";
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

export type CvData =
  | ClassicCvData
  | ModernCvData
  | ExecutiveCvData
  | CompactCvData
  | MinimalCvData
  | SidebarCvData
  | TimelineCvData;

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
  id: string;
  name: string;
  templateId: string;
  locale: CvLocale;
  data: FullCvData;
  sectionLabels: Record<string, string>;
  hiddenSections: string[];
  pageBreaks: string[];
  sectionOrder: string[];
  colors: Record<string, Record<string, string>>;
  createdAt: number;
  updatedAt: number;
};

export function projectCv(
  full: FullCvData,
  templateId: string,
  hiddenSections: string[] = [],
  pageBreaks: string[] = [],
  sectionOrder: string[] = [],
  colors: Record<string, string> = {},
  locale: CvLocale = "en",
  sectionLabels: Record<string, string> = {},
): CvData {
  const hide = new Set(hiddenSections);
  const customSections = (full.customSections ?? []).filter(
    (s) => !hide.has(s.id),
  );
  const skills = full.skills ?? [];
  const languages = full.languages ?? [];
  const experiences = full.experiences ?? [];
  const projects = full.projects ?? [];
  const education = full.education ?? [];
  const certifications = full.certifications ?? [];
  switch (templateId) {
    case "modern":
      return {
        kind: "modern",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        projects: hide.has("projects") ? [] : projects,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    case "executive":
      return {
        kind: "executive",
        locale,
        profile: full.profile,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        education: hide.has("education") ? [] : education,
        certifications: hide.has("certifications") ? [] : certifications,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    case "compact":
      return {
        kind: "compact",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    case "minimal":
      return {
        kind: "minimal",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        projects: hide.has("projects") ? [] : projects,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    case "sidebar":
      return {
        kind: "sidebar",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        projects: hide.has("projects") ? [] : projects,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    case "timeline":
      return {
        kind: "timeline",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        projects: hide.has("projects") ? [] : projects,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
    default:
      return {
        kind: "classic",
        locale,
        profile: full.profile,
        skills: hide.has("skills") ? [] : skills,
        languages: hide.has("languages") ? [] : languages,
        experiences: hide.has("experience") ? [] : experiences,
        projects: hide.has("projects") ? [] : projects,
        education: hide.has("education") ? [] : education,
        customSections,
        pageBreaks,
        sectionOrder,
        colors,
        sectionLabels,
      };
  }
}

export function makeDefaultFullCv(locale: CvLocale = "en"): FullCvData {
  if (locale === "ro") {
    return {
      profile: {
        name: "Jane Doe",
        title: "Senior Data Analyst",
        location: "București, România",
        email: "test@example.com",
        website: "portfolio.example",
        summary:
          "Data Analyst cu experiență în analiză de business, vizualizare de date și automatizarea proceselor de raportare. Specializat în transformarea datelor complexe în insight-uri utile pentru decizii de produs și strategie.",
      },

      skills: [
        "SQL",
        "Python",
        "Power BI",
        "Tableau",
        "Excel Avansat",
        "ETL",
        "Data Visualization",
        "Google Analytics",
        "BigQuery",
        "A/B Testing",
        "Data Modeling",
        "Business Intelligence",
      ],

      experiences: [
        {
          id: crypto.randomUUID(),
          company: "Insight Metrics",
          role: "Senior Data Analyst",
          period: "2022 - Prezent",
          highlights: [
            "Am dezvoltat dashboard-uri executive pentru monitorizarea KPI-urilor de business și performanță operațională.",
            "Am automatizat procese de raportare săptămânală, reducând timpul de generare a rapoartelor cu peste 60%.",
            "Am colaborat cu echipele de produs și marketing pentru analiza comportamentului utilizatorilor și optimizarea retenției.",
          ],
        },

        {
          id: crypto.randomUUID(),
          company: "Digital Growth Solutions",
          role: "Data Analyst",
          period: "2019 - 2022",
          highlights: [
            "Am construit fluxuri ETL pentru centralizarea datelor din multiple surse interne și externe.",
            "Am realizat analize de cohortă și segmentare pentru identificarea oportunităților de creștere.",
            "Am implementat sisteme de tracking și validare a datelor pentru îmbunătățirea acurateței rapoartelor.",
          ],
        },
      ],

      projects: [
        {
          id: crypto.randomUUID(),
          name: "Sales Performance Dashboard",
          description:
            "Platformă de raportare pentru monitorizarea performanței vânzărilor și identificarea tendințelor comerciale.",
          stack: "Power BI, SQL, Python",
        },

        {
          id: crypto.randomUUID(),
          name: "Customer Retention Analysis",
          description:
            "Analiză predictivă pentru identificarea factorilor care influențează retenția utilizatorilor.",
          stack: "Python, Pandas, Scikit-learn",
        },
      ],

      education: [
        {
          id: crypto.randomUUID(),
          degree: "Master, Statistică și Analiza Datelor",
          institution: "Academia de Studii Economice din București",
          period: "2016 - 2018",
        },

        {
          id: crypto.randomUUID(),
          degree: "Licență, Informatică Economică",
          institution: "Academia de Studii Economice din București",
          period: "2013 - 2016",
        },
      ],

      certifications: [
        {
          id: crypto.randomUUID(),
          name: "Microsoft Certified: Data Analyst Associate",
          issuer: "Microsoft",
          year: "2023",
        },

        {
          id: crypto.randomUUID(),
          name: "Google Data Analytics Professional Certificate",
          issuer: "Google",
          year: "2022",
        },
      ],

      languages: [
        {
          id: crypto.randomUUID(),
          language: "Română",
          listening: "C2",
          reading: "C2",
          dialog: "C2",
          reproduce: "C2",
          writing: "C2",
        },

        {
          id: crypto.randomUUID(),
          language: "Engleză",
          listening: "C1",
          reading: "C1",
          dialog: "C1",
          reproduce: "C1",
          writing: "C1",
        },
      ],

      customSections: [],
    };
  }

  return {
    profile: {
      name: "Jane Doe",
      title: "Senior Software Engineer",
      location: "Remote",
      email: "test@example.com",
      website: "portfolio.example",
      summary:
        "Product-focused engineer with experience building reliable web applications, improving performance, and scaling shared UI systems.",
    },
    skills: [
      "React",
      "TypeScript",
      "TanStack",
      "Node.js",
      "GraphQL",
      "CI/CD",
      "Web Performance",
      "Design Systems",
      "E2E Testing",
    ],
    experiences: [
      {
        id: crypto.randomUUID(),
        company: "Product Studio Co.",
        role: "Lead Engineer",
        period: "2022 - Present",
        highlights: [
          "Led migration from a legacy single-page app to a modular React architecture.",
          "Implemented PDF export workflows for user-generated documents.",
          "Improved release confidence by introducing automated UI and integration testing.",
        ],
      },
      {
        id: crypto.randomUUID(),
        company: "Data Platform Inc.",
        role: "Senior Frontend Engineer",
        period: "2019 - 2022",
        highlights: [
          "Built reusable dashboard modules used across multiple product teams.",
          "Introduced design tokens and accessibility checks into the development workflow.",
          "Collaborated with product teams to improve onboarding conversion and retention.",
        ],
      },
    ],
    projects: [
      {
        id: crypto.randomUUID(),
        name: "Document Builder",
        description:
          "Web app for creating structured documents with live preview and export.",
        stack: "React, TypeScript, PDF Rendering",
      },
      {
        id: crypto.randomUUID(),
        name: "Analytics Dashboard",
        description:
          "Performance and engagement dashboard with role-based views.",
        stack: "React, APIs, SQL",
      },
    ],
    education: [
      {
        id: crypto.randomUUID(),
        degree: "MSc, Human-Computer Interaction",
        institution: "State University",
        period: "2014 - 2016",
      },
      {
        id: crypto.randomUUID(),
        degree: "BSc, Computer Science",
        institution: "Institute of Technology",
        period: "2011 - 2014",
      },
    ],
    certifications: [
      {
        id: crypto.randomUUID(),
        name: "Cloud Architecture Certification",
        issuer: "Accredited Training Provider",
        year: "2023",
      },
    ],
    languages: [
      {
        id: crypto.randomUUID(),
        language: "English",
        listening: "C2",
        reading: "C2",
        dialog: "C2",
        reproduce: "C2",
        writing: "C2",
      },
      {
        id: crypto.randomUUID(),
        language: "Romanian",
        listening: "C1",
        reading: "C1",
        dialog: "C1",
        reproduce: "C1",
        writing: "C1",
      },
    ],
    customSections: [],
  };
}

export const DEFAULT_FULL_CV: FullCvData = makeDefaultFullCv("en");

const DEFAULT_SECTION_LABELS: Record<
  CvLocale,
  Record<string, Record<string, string>>
> = {
  en: {
    classic: {
      profile: "Profile",
      skills: "Core Skills",
      experience: "Experience",
      projects: "Selected Projects",
      education: "Education",
      languages: "Languages",
    },
    modern: {
      profile: "Profile",
      contact: "Contact",
      skills: "Skills",
      experience: "Experience",
      projects: "Selected Projects",
      education: "Education",
      languages: "Languages",
    },
    executive: {
      profile: "Executive Summary",
      experience: "Professional Experience",
      education: "Education",
      certifications: "Certifications",
      languages: "Languages",
    },
    compact: {
      about: "About",
      skills: "Skills",
      experience: "Experience",
      education: "Education",
      languages: "Languages",
    },
    minimal: {
      profile: "About",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      education: "Education",
      languages: "Languages",
    },
    sidebar: {
      profile: "Profile",
      contact: "Contact",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      education: "Education",
      languages: "Languages",
    },
    timeline: {
      profile: "Profile",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      education: "Education",
      languages: "Languages",
    },
  },
  ro: {
    classic: {
      profile: "Profil",
      skills: "Competente cheie",
      experience: "Experienta",
      projects: "Proiecte selectate",
      education: "Educatie",
      languages: "Limbi",
    },
    modern: {
      profile: "Profil",
      contact: "Contact",
      skills: "Competente",
      experience: "Experienta",
      projects: "Proiecte selectate",
      education: "Educatie",
      languages: "Limbi",
    },
    executive: {
      profile: "Rezumat executiv",
      experience: "Experienta profesionala",
      education: "Educatie",
      certifications: "Certificari",
      languages: "Limbi",
    },
    compact: {
      about: "Despre",
      skills: "Competente",
      experience: "Experienta",
      education: "Educatie",
      languages: "Limbi",
    },
    minimal: {
      profile: "Despre",
      skills: "Competente",
      experience: "Experienta",
      projects: "Proiecte",
      education: "Educatie",
      languages: "Limbi",
    },
    sidebar: {
      profile: "Profil",
      contact: "Contact",
      skills: "Competente",
      experience: "Experienta",
      projects: "Proiecte",
      education: "Educatie",
      languages: "Limbi",
    },
    timeline: {
      profile: "Profil",
      skills: "Competente",
      experience: "Experienta",
      projects: "Proiecte",
      education: "Educatie",
      languages: "Limbi",
    },
  },
};

export function getDefaultSectionLabelsForTemplate(
  templateId: string,
  locale: CvLocale,
): Record<string, string> {
  return (
    DEFAULT_SECTION_LABELS[locale][templateId] ??
    DEFAULT_SECTION_LABELS.en.classic
  );
}

export function getDefaultSectionLabel(
  templateId: string,
  sectionKey: string,
  locale: CvLocale,
): string {
  return (
    getDefaultSectionLabelsForTemplate(templateId, locale)[sectionKey] ??
    sectionKey
  );
}
