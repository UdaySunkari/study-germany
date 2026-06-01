// ============================================================================
//  Meridian front-end API client
//  Talks to the Node/Express backend. The base URL is derived automatically:
//   • Served by the Node app (production)  → same origin, e.g. https://uday.noctura.cloud/api
//   • Opened as a local file (file://)     → http://localhost:4000/api
//  Override anytime by setting window.MERIDIAN_API before this script loads.
// ============================================================================
const API_BASE =
  (typeof window !== 'undefined' && window.MERIDIAN_API) ||
  (location.protocol === 'file:' ? 'http://localhost:4000/api' : location.origin + '/api');

const Meridian = (() => {
  const TOKEN_KEY = 'meridian_token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }
  function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, { method = 'GET', body, params } = {}) {
    let url = API_BASE + path;
    if (params) {
      const q = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();
      if (q) url += '?' + q;
    }
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    const res = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
    return data;
  }

  // Is a backend configured & reachable?  Cached after first check.
  let _online = null;
  async function isOnline() {
    if (_online !== null) return _online;
    try {
      const r = await fetch(API_BASE + '/health', { method: 'GET' });
      _online = r.ok;
    } catch {
      _online = false;
    }
    return _online;
  }

  return {
    isOnline,
    getToken,
    setToken,

    // auth
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }).then((r) => {
        Meridian.setToken(r.token);
        return r;
      }),
    register: (firstName, lastName, email, password) =>
      request('/auth/register', { method: 'POST', body: { firstName, lastName, email, password } }).then(
        (r) => {
          Meridian.setToken(r.token);
          return r;
        }
      ),
    logout: () => request('/auth/logout', { method: 'POST' }).finally(() => Meridian.setToken('')),
    me: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/me', { method: 'PATCH', body }),
    changePassword: (currentPassword, newPassword) =>
      request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

    // dashboard
    overview: () => request('/account/overview'),

    // applications
    applications: (params) => request('/applications', { params }),
    application: (id) => request('/applications/' + id),
    createApplication: (body) => request('/applications', { method: 'POST', body }),
    updateApplication: (id, body) => request('/applications/' + id, { method: 'PATCH', body }),

    // universities (filterable)
    universities: (params) => request('/universities', { params }),
    universityFilters: () => request('/universities/filters'),
    university: (id) => request('/universities/' + id),

    // messages
    conversations: (params) => request('/conversations', { params }),
    messages: (id) => request('/conversations/' + id + '/messages'),
    startConversation: (body) => request('/conversations', { method: 'POST', body }),
    sendMessage: (id, body) =>
      request('/conversations/' + id + '/messages', { method: 'POST', body: { body } }),

    // invoices
    invoices: (params) => request('/invoices', { params }),
    payInvoice: (id, paymentMethodId) =>
      request('/invoices/' + id + '/pay', { method: 'POST', body: { paymentMethodId } }),

    // documents
    documents: (params) => request('/documents', { params }),
    addDocument: (body) => request('/documents', { method: 'POST', body }),
    deleteDocument: (id) => request('/documents/' + id, { method: 'DELETE' }),

    // notifications
    notifications: (params) => request('/notifications', { params }),
    readNotification: (id) => request('/notifications/' + id + '/read', { method: 'POST' }),
    readAllNotifications: () => request('/notifications/read-all', { method: 'POST' }),

    // calendar / saved / settings
    calendar: (params) => request('/calendar', { params }),
    addEvent: (body) => request('/calendar', { method: 'POST', body }),
    savedCourses: () => request('/saved-courses'),
    settings: () => request('/settings'),
    updateSettings: (updates) => request('/settings', { method: 'PATCH', body: { updates } }),

    // account
    paymentMethods: () => request('/account/payment-methods'),
    sessions: () => request('/account/sessions'),
    revokeSession: (id) => request('/account/sessions/' + id, { method: 'DELETE' }),
  };
})();

window.Meridian = Meridian;
