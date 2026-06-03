// ============================================================================
//  Meridian — real authentication (Supabase)
//
//  ONE-TIME SETUP (~10 minutes):
//   1. Create a free project at https://supabase.com
//   2. Project Settings → API → copy two things:
//        • Project URL            → paste into SUPABASE_URL below
//        • Project API key "anon public" → paste into SUPABASE_ANON below
//      (The anon key is safe to ship in front-end code — it is meant to be public.)
//   3. Authentication → Users → "Add user" for each of you (email + password).
//   4. Put those same admin emails into ADMIN_EMAILS below.
//
//  That's it — login becomes real and the admin console becomes protected.
//  Until you fill these in, the site keeps working but the admin gate is OFF
//  (it will warn in the console instead of locking people out).
// ============================================================================

const SUPABASE_URL  = 'https://imuazoxpywjpccltyadt.supabase.co';       // e.g. https://abcd1234.supabase.co
const SUPABASE_ANON = 'sb_publishable_4uNLxDkCUmHcx8yrzo_vnw_5LcqCqZL';  // the long "anon public" key
const ADMIN_EMAILS  = [                          // only these emails get the admin console
  'udaykumar.sunkari1@gmail.com',
  'turbosolutionss@gmail.com',
];

const _configured = !/YOUR_SUPABASE/.test(SUPABASE_URL + SUPABASE_ANON)
  && typeof supabase !== 'undefined';

const _sb = _configured ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON) : null;

const Auth = {
  configured: _configured,
  client: _sb,

  async signIn(email, password) {
    if (!_sb) throw Object.assign(new Error('Auth not configured'), { code: 'no-config' });
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Create a new student account.
  async signUp(email, password) {
    if (!_sb) throw Object.assign(new Error('Auth not configured'), { code: 'no-config' });
    const { data, error } = await _sb.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut(redirectTo = 'Login.html') {
    if (_sb) await _sb.auth.signOut();
    window.location.replace(redirectTo);
  },

  async getUser() {
    if (!_sb) return null;
    const { data } = await _sb.auth.getUser();
    return data.user || null;
  },

  isAdmin(user) {
    if (!user) return false;
    const list = ADMIN_EMAILS.map((e) => e.toLowerCase());
    return list.includes((user.email || '').toLowerCase());
  },

  // Use at the top of a protected page. Redirects to login unless a valid
  // admin session exists. Returns the user (or null if it redirected).
  async requireAdmin(loginUrl = 'Login.html') {
    if (!_sb) {
      console.warn('[Auth] Supabase not configured yet — admin gate is OFF. Fill in auth.js to enable it.');
      return null;
    }
    const user = await this.getUser();
    if (!user || !this.isAdmin(user)) {
      window.location.replace(loginUrl);
      return null;
    }
    return user;
  },

  // Gate for any logged-in student page. Redirects to login if not signed in.
  async requireUser(loginUrl = 'Login.html') {
    if (!_sb) {
      console.warn('[Auth] Supabase not configured yet — login gate is OFF. Fill in auth.js to enable it.');
      return null;
    }
    const user = await this.getUser();
    if (!user) {
      window.location.replace(loginUrl);
      return null;
    }
    return user;
  },
};

window.Auth = Auth;