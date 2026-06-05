// ============================================================================
//  Admin demo data store.
//  Universities are CRUD-managed and persisted to localStorage so edits survive
//  reloads (in production these calls go to the backend via api.js / Meridian).
// ============================================================================
const AdminData = (() => {
  const UNI_KEY = 'meridian_admin_unis';

  const defaultUniversities = [
    { id: 1,  name: 'University College London', logo: 'UCL',  country: 'United Kingdom', cc: 'uk', flag: '<img class="flag-img" src="assets/flags/gb.svg" alt="" />', city: 'London',     founded: 1826, ranking: 9,  acceptance: 15, tuition: '£36k/yr',  photo: 'https://picsum.photos/seed/ucl/600/400' },
    { id: 2,  name: 'Imperial College London',   logo: 'IC',   country: 'United Kingdom', cc: 'uk', flag: '<img class="flag-img" src="assets/flags/gb.svg" alt="" />', city: 'London',     founded: 1907, ranking: 8,  acceptance: 14, tuition: '£36k/yr',  photo: 'https://picsum.photos/seed/imperial-uni/600/400' },
    { id: 3,  name: 'University of Toronto',      logo: 'UofT', country: 'Canada',         cc: 'ca', flag: '<img class="flag-img" src="assets/flags/ca.svg" alt="" />', city: 'Toronto',    founded: 1827, ranking: 21, acceptance: 43, tuition: 'CAD $58k', photo: 'https://picsum.photos/seed/toronto-uni/600/400' },
    { id: 4,  name: 'New York University',        logo: 'NYU',  country: 'United States',  cc: 'us', flag: '<img class="flag-img" src="assets/flags/us.svg" alt="" />', city: 'New York',   founded: 1831, ranking: 38, acceptance: 21, tuition: '$60k/yr',  photo: 'https://picsum.photos/seed/nyu-campus/600/400' },
    { id: 5,  name: 'Monash University',          logo: 'MON',  country: 'Australia',      cc: 'au', flag: '<img class="flag-img" src="assets/flags/au.svg" alt="" />', city: 'Melbourne',  founded: 1958, ranking: 49, acceptance: 60, tuition: 'AUD $42k', photo: 'https://picsum.photos/seed/monash-uni/600/400' },
    { id: 6,  name: 'ETH Zürich',                 logo: 'ETH',  country: 'Switzerland',    cc: 'ch', flag: '<img class="flag-img" src="assets/flags/ch.svg" alt="" />', city: 'Zürich',     founded: 1855, ranking: 7,  acceptance: 27, tuition: 'CHF 1.5k', photo: 'https://picsum.photos/seed/eth-zurich/600/400' },
    { id: 7,  name: 'Trinity College Dublin',     logo: 'TCD',  country: 'Ireland',        cc: 'ie', flag: '<img class="flag-img" src="assets/flags/ie.svg" alt="" />', city: 'Dublin',     founded: 1592, ranking: 87, acceptance: 34, tuition: '€21k/yr',  photo: 'https://picsum.photos/seed/trinity-college/600/400' },
    { id: 8,  name: 'TU Munich',                  logo: 'TUM',  country: 'Germany',        cc: 'de', flag: '<img class="flag-img" src="assets/flags/de.svg" alt="" />', city: 'Munich',     founded: 1868, ranking: 30, acceptance: 8,  tuition: '€0 tuition',photo: 'https://picsum.photos/seed/tum-munich/600/400' },
    { id: 9,  name: 'University of Edinburgh',     logo: 'EDI',  country: 'United Kingdom', cc: 'uk', flag: '<img class="flag-img" src="assets/flags/gb.svg" alt="" />', city: 'Edinburgh',  founded: 1583, ranking: 22, acceptance: 40, tuition: '£29k/yr',  photo: 'https://picsum.photos/seed/edinburgh-uni/600/400' },
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
  const clients = [
    { id: 'aanya',  name: 'Aanya Raj',     email: 'aanya.raj@example.com', avatar: 'https://i.pravatar.cc/120?img=47', counsellor: 'Riya Sharma',  apps: 5, stage: 'offer',  course: 'UCL · MSc Data Science', online: true,
      stats: { applications: 5, offers: 2, documents: 14 }, threadId: 'client:aanya' },
    { id: 'diego',  name: 'Diego Morales', email: 'diego.m@example.com',   avatar: 'https://i.pravatar.cc/120?img=12', counsellor: 'Marco Bellini', apps: 3, stage: 'active', course: 'U of Toronto · Civil Eng', online: false,
      stats: { applications: 3, offers: 1, documents: 9 }, threadId: 'client:diego' },
    { id: 'mei',    name: 'Mei Lin',       email: 'mei.lin@example.com',   avatar: 'https://i.pravatar.cc/120?img=32', counsellor: 'Sara Okonkwo', apps: 2, stage: 'active', course: 'Monash · MBA', online: true,
      stats: { applications: 2, offers: 0, documents: 7 }, threadId: 'client:mei' },
    { id: 'tobi',   name: 'Tobi Adeyemi',  email: 'tobi.a@example.com',    avatar: 'https://i.pravatar.cc/120?img=68', counsellor: 'Riya Sharma',  apps: 4, stage: 'offer',  course: 'NYU · MFA Film', online: false,
      stats: { applications: 4, offers: 3, documents: 11 }, threadId: 'client:tobi' },
    { id: 'rahul',  name: 'Rahul Patel',   email: 'rahul.p@example.com',   avatar: 'https://i.pravatar.cc/120?img=15', counsellor: 'Marco Bellini', apps: 2, stage: 'new',    course: 'TU Munich · MS CS', online: false,
      stats: { applications: 2, offers: 0, documents: 4 }, threadId: 'client:rahul' },
    { id: 'sara',   name: 'Sara Khan',     email: 'sara.k@example.com',    avatar: 'https://i.pravatar.cc/120?img=23', counsellor: 'Sara Okonkwo', apps: 1, stage: 'new',    course: 'Trinity · MSc', online: true,
      stats: { applications: 1, offers: 0, documents: 3 }, threadId: 'client:sara' },
  ];

  const applications = [
    { client: 'Aanya Raj',     cid: 'aanya', logo: 'UCL',  uni: 'University College London', course: 'MSc Data Science',      intake: 'Sept 2026', status: 'in-review' },
    { client: 'Aanya Raj',     cid: 'aanya', logo: 'UofT', uni: 'University of Toronto',     course: 'MSc Applied Computing', intake: 'Sept 2026', status: 'offer' },
    { client: 'Aanya Raj',     cid: 'aanya', logo: 'IC',   uni: 'Imperial College London',  course: 'MSc Computing Science', intake: 'Sept 2026', status: 'offer' },
    { client: 'Diego Morales', cid: 'diego', logo: 'UofT', uni: 'University of Toronto',     course: 'MASc Civil Engineering',intake: 'Sept 2026', status: 'offer' },
    { client: 'Diego Morales', cid: 'diego', logo: 'NYU',  uni: 'New York University',      course: 'MS Construction Mgmt',  intake: 'Fall 2026', status: 'submitted' },
    { client: 'Mei Lin',       cid: 'mei',   logo: 'MON',  uni: 'Monash University',        course: 'MBA',                   intake: 'July 2026', status: 'in-review' },
    { client: 'Tobi Adeyemi',  cid: 'tobi',  logo: 'NYU',  uni: 'New York University',      course: 'MFA Film',              intake: 'Fall 2026', status: 'offer' },
    { client: 'Rahul Patel',   cid: 'rahul', logo: 'TUM',  uni: 'TU Munich',                course: 'MS Computer Science',   intake: 'Oct 2026',  status: 'draft' },
    { client: 'Sara Khan',     cid: 'sara',  logo: 'TCD',  uni: 'Trinity College Dublin',   course: 'MSc Computer Science',  intake: 'Sept 2026', status: 'submitted' },
  ];

  const invoices = [
    { number: '#2026-0481', client: 'Aanya Raj',    item: 'Application service fee', issued: 'Apr 1, 2026',  amount: '$1,200', status: 'due' },
    { number: '#2026-0477', client: 'Diego Morales',item: 'SOP review package',      issued: 'Mar 30, 2026', amount: '$480',   status: 'paid' },
    { number: '#2026-0468', client: 'Mei Lin',      item: 'Visa documentation',      issued: 'Mar 26, 2026', amount: '$650',   status: 'due' },
    { number: '#2026-0455', client: 'Tobi Adeyemi', item: 'Full-service plan Y1',    issued: 'Mar 20, 2026', amount: '$1,950', status: 'paid' },
    { number: '#2026-0441', client: 'Rahul Patel',  item: 'Discovery & shortlist',   issued: 'Mar 14, 2026', amount: '$1,000', status: 'paid' },
    { number: '#2026-0418', client: 'Aanya Raj',    item: 'Visa documentation',      issued: 'Mar 20, 2026', amount: '$650',   status: 'paid' },
  ];

  const counsellors = [
    { name: 'Riya Sharma',   avatar: 'https://i.pravatar.cc/120?img=45', specialty: 'Applications & strategy', clients: 2, online: true },
    { name: 'Marco Bellini', avatar: 'https://i.pravatar.cc/120?img=12', specialty: 'SOPs & essays',           clients: 2, online: false },
    { name: 'Sara Okonkwo',  avatar: 'https://i.pravatar.cc/120?img=33', specialty: 'Visas & documentation',   clients: 2, online: true },
  ];

  return {
    getUniversities, addUniversity, updateUniversity, deleteUniversity, resetUniversities,
    clients, applications, invoices, counsellors,
  };
})();

window.AdminData = AdminData;
