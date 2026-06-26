import type { TranslationKey } from "./en"

export const ro: Record<TranslationKey, string> = {
  // ── Generic ────────────────────────────────────────────────────────────────
  "common.cancel": "Anulează",
  "common.delete": "Șterge",
  "common.export": "Exportă",
  "common.duplicate": "Duplică",
  "common.lang.en": "Engleză",
  "common.lang.ro": "Română",
  "common.cvLanguage": "Limba CV-ului",

  // ── Relative dates ─────────────────────────────────────────────────────────
  "date.today": "azi",
  "date.yesterday": "ieri",
  "date.daysAgo": "acum {n} zile",
  "date.weeksAgo": "acum {n} săpt.",

  // ── /cvs page ──────────────────────────────────────────────────────────────
  "cvs.title": "CV-urile tale",
  "cvs.subtitle": "Continuă de unde ai rămas sau începe ceva nou.",
  "cvs.statLabel": "CV-uri",
  "cvs.tip":
    "Sfat: păstrează un CV pentru fiecare rol vizat — ajustează rezumatul și competențele pentru fiecare.",
  "cvs.updated": "Actualizat {date}",
  "cvs.active": "Activ",
  "cvs.openActive": "Deschide →",
  "cvs.renameHint": "Click pentru a redenumi",
  "cvs.exportHint": "Exportă backup JSON",
  "cvs.empty.title": "Niciun CV încă",
  "cvs.empty.hint":
    "Creează primul CV pentru a alege un șablon și a începe să completezi detaliile.",
  "cvs.empty.create": "+ Creează primul CV",
  "cvs.empty.importLink": "Sau importă un backup",
  "cvs.new.title": "Label",
  "cvs.new.namePlaceholder": "ex. Dev Frontend, Freelancer…",
  "cvs.new.create": "Creează & deschide",
  "cvs.new.tileLabel": "CV nou",
  "cvs.new.tileHint": "Pornește de la un șablon nou",
  "cvs.importBackup": "Importă backup",
  "cvs.deleteConfirm": "Ștergi acest CV? Acțiunea nu poate fi anulată.",
  "cvs.importFailed": "Importul a eșuat.",

  // ── Home page (/) ───────────────────────────────────────────────────────────
  "home.badge": "Constructor CV",
  "home.hero.before": "Un CV",
  "home.hero.em": "care merită",
  "home.hero.after": "păstrat.",
  "home.hero.subtitle":
    "Alege un șablon, completează-ți detaliile și descarcă un PDF gata de tipărire — fără cont necesar.",
  "home.cta": "Începe →",
  "home.step1.label": "Alege un șablon",
  "home.step1.desc": "Alege din modele curate și profesionale.",
  "home.step2.label": "Completează-ți detaliile",
  "home.step2.desc": "Editează totul într-un editor live.",
  "home.step3.label": "Exportă în PDF",
  "home.step3.desc": "Descarcă un PDF gata de tipărire instant.",

  // ── Print page (/cv/print) ──────────────────────────────────────────────────
  "print.download": "Descarcă PDF",
  "print.loadingTemplate": "Se încarcă șablonul…",
  "print.renderingPdf": "Se randează PDF-ul…",
  "print.renderError": "Eroare la randarea PDF-ului: {message}",
  "print.iframeTitle": "Previzualizare CV PDF",

  // ── Templates page (/templates) ─────────────────────────────────────────────
  "templates.statLabel": "\u0218abloane",
  "templates.hint":
    "D\u0103 click pe un \u0219ablon pentru a-l previzualiza cu datele tale. Apas\u0103 \u201cFolose\u0219te \u0219ablonul\u201d pentru a-l face layout-ul t\u0103u curent.",
  "templates.listAriaLabel": "List\u0103 \u0219abloane",
  "templates.active": "Activ",
  "templates.use": "Folose\u0219te \u0219ablonul",
  "templates.loadingTemplate": "Se \u00eencarc\u0103 \u0219ablonul\u2026",
  "templates.rendering": "Se randeaz\u0103\u2026",
  "templates.regenerating": "Se regenereaz\u0103\u2026",
  "templates.iframeTitle": "Previzualizare PDF",

  // ── Edit page (/cv/edit) ────────────────────────────────────────────────────
  "edit.untitled": "F\u0103r\u0103 titlu",
  "edit.add": "+ Adaug\u0103",
  "edit.addBtn": "Adaug\u0103",
  "edit.period": "Perioad\u0103",
  "edit.bullet.placeholder": "Punct de list\u0103...",
  "edit.moveUp": "Mut\u0103 sus",
  "edit.moveDown": "Mut\u0103 jos",

  // CEFR fields
  "edit.cefr.listen": "Ascult\u0103",
  "edit.cefr.listen.title": "Ascultare",
  "edit.cefr.read": "Cite\u0219te",
  "edit.cefr.read.title": "Citire",
  "edit.cefr.speak": "Vorbe\u0219te",
  "edit.cefr.speak.title": "Interac\u021biune oral\u0103",
  "edit.cefr.produce": "Produce",
  "edit.cefr.produce.title": "Producere oral\u0103",
  "edit.cefr.write": "Scrie",
  "edit.cefr.write.title": "Scriere",

  // Template switcher
  "edit.template.change": "Schimb\u0103 \u0219ablonul",
  "edit.template.compare": "Compar\u0103 toate \u00een paralel \u2192",

  // Top bar
  "edit.topbar.form": "Formular",
  "edit.topbar.preview": "Previzualizare",
  "edit.topbar.download": "Descarc\u0103 PDF",
  "edit.topbar.reset": "Reseteaz\u0103",

  // Collapsible section
  "edit.section.hidden": "Ascuns din PDF",
  "edit.section.pageBreak": "\u23ce Ruptur\u0103 de pagin\u0103",
  "edit.section.pageBreak.title": "\u00cencepe aceast\u0103 sec\u021biune pe o pagin\u0103 nou\u0103",
  "edit.section.moveUp.aria": "Mut\u0103 sec\u021biunea sus",
  "edit.section.moveDown.aria": "Mut\u0103 sec\u021biunea jos",
  "edit.section.show": "Arat\u0103 \u00een PDF",
  "edit.section.hide": "Ascunde",

  // Item header
  "edit.item.expand": "Extinde intrarea",
  "edit.item.collapse": "Restr\u00e2nge intrarea",
  "edit.item.moveUp.aria": "Mut\u0103 intrarea sus",
  "edit.item.moveDown.aria": "Mut\u0103 intrarea jos",
  "edit.item.remove": "Elimin\u0103",

  // Save status
  "edit.save.saved": "Toate modific\u0103rile salvate",
  "edit.save.saving": "Se salveaz\u0103...",

  // Reset confirm
  "edit.resetConfirm": "Resetezi toate datele CV la valori implicite? Ac\u021biunea nu poate fi anulat\u0103.",

  // Quick jump nav
  "edit.nav.quickJump": "S\u0103ritur\u0103 rapid\u0103",
  "edit.nav.profile": "Profil",
  "edit.nav.colors": "Culori",
  "edit.nav.labels": "Etichete sec\u021biuni",
  "edit.nav.skills": "Competen\u021be cheie",
  "edit.nav.languages": "Limbi",
  "edit.nav.experience": "Experien\u021b\u0103",
  "edit.nav.projects": "Proiecte selectate",
  "edit.nav.education": "Educa\u021bie",
  "edit.nav.certifications": "Certific\u0103ri",
  "edit.nav.custom": "Sec\u021biune personalizat\u0103",

  // Profile section
  "edit.profile.title": "Profil",
  "edit.profile.fullName": "Nume complet",
  "edit.profile.jobTitle": "Titlu profesional",
  "edit.profile.location": "Loca\u021bie",
  "edit.profile.email": "Email",
  "edit.profile.website": "Website",
  "edit.profile.summary": "Rezumat",

  // Colors section
  "edit.colors.title": "Culori",
  "edit.colors.reset": "Reseteaz\u0103",
  "edit.colors.openPicker": "{label} \u2014 deschide selector",
  "edit.colors.picker.aria": "Selector culoare {label}",
  "edit.colors.hex.aria": "Valoare hex {label}",
  "edit.colors.useHex.aria": "Folose\u0219te {hex}",

  // Section labels
  "edit.labels.title": "Etichete sec\u021biuni",

  // Skills
  "edit.skills.placeholder": "Competen\u021b\u0103 nou\u0103...",
  "edit.skills.remove.aria": "Elimin\u0103 competen\u021b\u0103",

  // Languages
  "edit.languages.motherTongueNote": "Primul r\u00e2nd este Limba Matern\u0103 \u00een PDF \u2014 reordoneaz\u0103 pentru a schimba.",
  "edit.languages.motherTongue": "Limba matern\u0103",
  "edit.languages.motherTongueShort": "Limba Matern\u0103",
  "edit.languages.language": "Limb\u0103",
  "edit.languages.placeholder": "Nume limb\u0103...",

  // Experience
  "edit.experience.title": "Experien\u021b\u0103",
  "edit.experience.role": "Rol",
  "edit.experience.company": "Companie",
  "edit.experience.period.placeholder": "ex. 2022 - Prezent",
  "edit.experience.highlights": "Repere",
  "edit.experience.bullet.remove.aria": "Elimin\u0103 reper",
  "edit.experience.addBullet": "+ Adaug\u0103 punct",

  // Projects
  "edit.projects.title": "Proiecte selectate",
  "edit.projects.name": "Nume",
  "edit.projects.stack": "Tehnologii",
  "edit.projects.stack.placeholder": "ex. React, TypeScript",
  "edit.projects.description": "Descriere",

  // Education
  "edit.education.title": "Educa\u021bie",
  "edit.education.degree": "Diplom\u0103",
  "edit.education.institution": "Institu\u021bie",
  "edit.education.period.placeholder": "ex. 2011 - 2014",

  // Certifications
  "edit.certifications.title": "Certific\u0103ri",
  "edit.certifications.name": "Nume",
  "edit.certifications.name.placeholder": "ex. AWS Certified Solutions Architect",
  "edit.certifications.issuer": "Emitent",
  "edit.certifications.issuer.placeholder": "ex. Amazon Web Services",
  "edit.certifications.year": "An",
  "edit.certifications.year.placeholder": "ex. 2023",

  // Custom section
  "edit.custom.title": "Sec\u021biune personalizat\u0103",
  "edit.custom.delete": "\u0218terge sec\u021biunea",
  "edit.custom.sectionTitle": "Titlu sec\u021biune",
  "edit.custom.titlePlaceholder": "ex. Voluntariat",
  "edit.custom.bullets": "Puncte",
  "edit.custom.bullet.remove.aria": "Elimin\u0103 punct",
  "edit.custom.addBullet": "+ Adaug\u0103 punct",
  "edit.custom.add": "+ Adaug\u0103 sec\u021biune personalizat\u0103",

  // Preview panel
  "edit.preview.label": "Previzualizare live \u00b7 {name}",
  "edit.preview.loading": "Se \u00eencarc\u0103 \u0219ablonul\u2026",
  "edit.preview.rendering": "Se randeaz\u0103 previzualizarea\u2026",
  "edit.preview.error": "Eroare la randarea previzualiz\u0103rii",
  "edit.preview.iframeTitle": "Previzualizare CV",

  // ── Template definitions ────────────────────────────────────────────────────
  "template.classic.name": "Clasic",
  "template.classic.description":
    "Tipografie serif cu antet pe dou\u0103 coloane \u0219i tonuri de pergament.",
  "template.modern.name": "Modern",
  "template.modern.description":
    "Layout cu bar\u0103 lateral\u0103 \u00eentunecat\u0103, accent albastru \u0219i tipografie sans-serif.",
  "template.executive.name": "Executiv",
  "template.executive.description":
    "Layout serif pe toat\u0103 l\u0103\u021bimea cu certific\u0103ri.",
  "template.compact.name": "Compact",
  "template.compact.description":
    "Layout pe dou\u0103 coloane cu bar\u0103 de antet albastr\u0103, bar\u0103 lateral\u0103 de competen\u021be.",
  "template.minimal.name": "Minimal",
  "template.minimal.description":
    "Layout aerisit pe o singur\u0103 coloan\u0103 cu antet centrat, linii sub\u021biri \u0219i competen\u021be inline.",
  "template.sidebar.name": "Bar\u0103 lateral\u0103",
  "template.sidebar.description":
    "Bar\u0103 lateral\u0103 crem pe dreapta cu contact, competen\u021be \u0219i limbi; con\u021binut principal pe st\u00e2nga.",
  "template.timeline.name": "Cronologie",
  "template.timeline.description":
    "Antet centrat cu o cronologie vertical\u0103 accentuat\u0103 \u0219i markeri pentru intr\u0103rile de experien\u021b\u0103.",

  // ── Color slot labels ───────────────────────────────────────────────────────
  "template.color.accent": "Accent",
  "template.color.ink": "Text",
  "template.color.muted": "Text secundar",
  "template.color.sidebarBg": "Bar\u0103 lateral\u0103",
  "template.color.sidebarAccent": "Accent bar\u0103 lateral\u0103",
}
