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
//   4. Run admin-rls-setup.sql in the Supabase SQL editor. That file grants you
//      admin, turns on Row-Level Security, and writes the policies that actually
//      protect the data. Admin status now lives in the database (app_metadata.role),
//      NOT in this file — so it can't be read off or bypassed from the browser.
//
//  That's it — login becomes real and the data becomes protected at the database
//  layer. The checks in this file are only UX (hide/redirect); the real security
//  is the RLS policies. Until Supabase is configured the site still works, but the
//  gate is OFF (it warns in the console instead of locking people out).
// ============================================================================

const SUPABASE_URL  = 'https://imuazoxpywjpccltyadt.supabase.co';       // e.g. https://abcd1234.supabase.co
const SUPABASE_ANON = 'sb_publishable_4uNLxDkCUmHcx8yrzo_vnw_5LcqCqZL';  // the long "anon public" key

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

  // Create a new student account (name is stored in the user's profile metadata).
  async signUp(email, password, fullName) {
    if (!_sb) throw Object.assign(new Error('Auth not configured'), { code: 'no-config' });
    const { data, error } = await _sb.auth.signUp({
      email, password,
      options: fullName ? { data: { full_name: fullName } } : undefined
    });
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
    // Admin status is set on the server (Supabase app_metadata.role) and rides
    // inside the signed JWT, so it can't be forged from the browser. This check
    // is only a UX hint for hiding/redirecting — the data itself is protected by
    // the RLS policies in admin-rls-setup.sql, which Postgres enforces server-side.
    return (user.app_metadata && user.app_metadata.role) === 'admin';
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