// ============================================================================
//  Admin demo data store.
//  Universities are CRUD-managed and persisted to localStorage so edits survive
//  reloads (in production these calls go to the backend via api.js / Meridian).
// ============================================================================
const AdminData = (() => {
  const UNI_KEY = 'vayas_admin_unis_v2';

  const defaultUniversities = [
    { id: 1, name: 'TU München',                  logo: 'TUM', country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Munich',     founded: 1868, ranking: 28,  acceptance: 0, tuition: 'intl fees apply',   photo: '' },
    { id: 2, name: 'LMU München',                 logo: 'LMU', country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Munich',     founded: 1472, ranking: 59,  acceptance: 0, tuition: '€0 tuition',        photo: '' },
    { id: 3, name: 'Heidelberg University',       logo: 'HEI', country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Heidelberg', founded: 1386, ranking: 84,  acceptance: 0, tuition: '€1.5k/sem non-EU',  photo: '' },
    { id: 4, name: 'RWTH Aachen',                 logo: 'RWTH',country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Aachen',     founded: 1870, ranking: 99,  acceptance: 0, tuition: '€0 tuition',        photo: '' },
    { id: 5, name: 'TU Berlin',                   logo: 'TUB', country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Berlin',     founded: 1879, ranking: 147, acceptance: 0, tuition: '€0 tuition',        photo: '' },
    { id: 6, name: 'Charles University',          logo: 'CUNI',country: 'Czech Republic', cc: 'cz', flag: '<img class="flag-img" src="assets/flags/cz.svg" alt="" />', city: 'Prague',     founded: 1348, ranking: 246, acceptance: 0, tuition: '€2–6k/yr (EN)',     photo: '' },
    { id: 7, name: 'Czech Technical University',  logo: 'CTU', country: 'Czech Republic', cc: 'cz', flag: '<img class="flag-img" src="assets/flags/cz.svg" alt="" />', city: 'Prague',     founded: 1707, ranking: 420, acceptance: 0, tuition: '€2–6k/yr (EN)',     photo: '' },
    { id: 8, name: 'Masaryk University',          logo: 'MUNI',country: 'Czech Republic', cc: 'cz', flag: '<img class="flag-img" src="assets/flags/cz.svg" alt="" />', city: 'Brno',       founded: 1919, ranking: 400, acceptance: 0, tuition: '€2–5k/yr (EN)',     photo: '' },
  ];

  function getUniversities() {
    try {
      const stored = JSON.parse(localStorage.getItem(UNI_KEY) || 'null');
      if (stored && Array.isArray(stored)) return stored;
    } catch {}
    localStorage.setItem(UNI_KEY, JSON.stringify(defaultUniversities));
    return [...defaultUniversities];
  }
  function saveUniversities(list) {
    localStorage.setItem(UNI_KEY, JSON.stringify(list));
  }
  function addUniversity(u) {
    const list = getUniversities();
    u.id = Math.max(0, ...list.map((x) => x.id)) + 1;
    list.push(u);
    saveUniversities(list);
    return u;
  }
  function updateUniversity(id, patch) {
    const list = getUniversities();
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...patch }; saveUniversities(list); return list[i]; }
    return null;
  }
  function deleteUniversity(id) {
    saveUniversities(getUniversities().filter((x) => x.id !== id));
  }
  function resetUniversities() {
    localStorage.removeItem(UNI_KEY);
    return getUniversities();
  }

  // ── Clients (read-only demo) ────────────────────────────────
  const clients = [];

  const applications = [];

  const invoices = [];

  const counsellors = [];

  return {
    getUniversities, addUniversity, updateUniversity, deleteUniversity, resetUniversities,
    clients, applications, invoices, counsellors,
  };
})();

window.AdminData = AdminData;