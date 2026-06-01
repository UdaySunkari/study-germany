// ============================================================================
//  Meridian — Live Chat transport
//  Works in two modes, transparently:
//   • PRODUCTION: connects to the backend WebSocket (ws://.../ws) when reachable.
//   • PREVIEW/OFFLINE: uses BroadcastChannel so two browser tabs on the same
//     origin (e.g. the student Dashboard and the AdminDashboard) exchange
//     messages live, with localStorage for persistence/history.
//
//  Public API:
//    LiveChat.init({ role, userId, name, avatar })
//    LiveChat.open(threadId)                         -> returns stored history []
//    LiveChat.send({ threadId, body, attachment })
//    LiveChat.typing(threadId, isTyping)
//    LiveChat.on('message'|'typing'|'presence', cb)
//    LiveChat.history(threadId) -> []
//    LiveChat.threads() -> [{ threadId, last, ts, unread }]
// ============================================================================
const LiveChat = (() => {
  // WebSocket endpoint — derived from the page origin in production, localhost in dev.
  const WS_BASE =
    (typeof window !== 'undefined' && window.MERIDIAN_WS) ||
    (location.protocol === 'file:'
      ? 'ws://localhost:4000/ws'
      : (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
  const CHANNEL = 'meridian-livechat';
  const STORE_PREFIX = 'meridian_chat_';
  const INDEX_KEY = 'meridian_chat_index';

  let me = { role: 'student', userId: null, name: 'You', avatar: '' };
  let bc = null;
  let ws = null;
  const handlers = { message: [], typing: [], presence: [] };

  // ── storage helpers ──────────────────────────────────────────
  function load(threadId) {
    try { return JSON.parse(localStorage.getItem(STORE_PREFIX + threadId) || '[]'); }
    catch { return []; }
  }
  function save(threadId, list) {
    localStorage.setItem(STORE_PREFIX + threadId, JSON.stringify(list.slice(-500)));
    // maintain a light index for thread lists
    let idx = {};
    try { idx = JSON.parse(localStorage.getItem(INDEX_KEY) || '{}'); } catch {}
    const last = list[list.length - 1];
    idx[threadId] = { last: last ? last.body : '', ts: last ? last.ts : Date.now() };
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  }
  function append(threadId, msg) {
    const list = load(threadId);
    // de-dupe by id
    if (msg.id && list.some((m) => m.id === msg.id)) return list;
    list.push(msg);
    save(threadId, list);
    return list;
  }

  function emit(type, payload) {
    handlers[type].forEach((cb) => {
      try { cb(payload); } catch (e) { console.error(e); }
    });
  }

  // ── transport ────────────────────────────────────────────────
  function broadcast(data) {
    const packet = { ...data, _origin: me.userId || me.role, _t: Date.now() };
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(packet));
    if (bc) bc.post(packet);
  }

  function route(data) {
    if (!data || data._origin === (me.userId || me.role)) return; // ignore own echoes
    if (data.kind === 'message') {
      // store on receiver side too
      append(data.threadId, data.msg);
      emit('message', { threadId: data.threadId, msg: data.msg });
    } else if (data.kind === 'typing') {
      emit('typing', { threadId: data.threadId, from: data.from, typing: data.typing });
    } else if (data.kind === 'presence') {
      emit('presence', { role: data.role, name: data.name, online: data.online });
    }
  }

  function tryWebSocket() {
    try {
      const token = localStorage.getItem('meridian_token') || '';
      ws = new WebSocket(
        WS_BASE + '?token=' + encodeURIComponent(token) +
        '&role=' + encodeURIComponent(me.role) +
        '&uid=' + encodeURIComponent(me.userId || '')
      );
      ws.onmessage = (e) => {
        try { route(JSON.parse(e.data)); } catch {}
      };
      ws.onopen = () => {
        emit('presence', { role: 'server', online: true });
        // re-join any threads opened before the socket was ready
        joinedThreads.forEach((t) => ws.send(JSON.stringify({ kind: 'join', threadId: t })));
      };
      ws.onerror = () => {};
      ws.onclose = () => { ws = null; };
    } catch {
      ws = null;
    }
  }

  const joinedThreads = new Set();
  function joinThread(threadId) {
    joinedThreads.add(threadId);
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ kind: 'join', threadId }));
  }

  // ── public API ───────────────────────────────────────────────
  function init(opts = {}) {
    me = { ...me, ...opts };
    // BroadcastChannel (cross-tab live, offline-friendly)
    try {
      const channel = new BroadcastChannel(CHANNEL);
      bc = {
        post: (d) => channel.postMessage(d),
        close: () => channel.close(),
      };
      channel.onmessage = (e) => route(e.data);
    } catch {
      // Safari private mode etc → fall back to storage events
      bc = {
        post: (d) => localStorage.setItem(CHANNEL, JSON.stringify({ ...d, _r: Math.random() })),
        close: () => {},
      };
      window.addEventListener('storage', (e) => {
        if (e.key === CHANNEL && e.newValue) { try { route(JSON.parse(e.newValue)); } catch {} }
      });
    }
    tryWebSocket();
    // announce presence
    broadcast({ kind: 'presence', role: me.role, name: me.name, online: true });
    window.addEventListener('beforeunload', () =>
      broadcast({ kind: 'presence', role: me.role, name: me.name, online: false })
    );
    return LiveChat;
  }

  function open(threadId) {
    joinThread(threadId);
    return load(threadId);
  }

  function send({ threadId, body, attachment }) {
    const msg = {
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      from: me.role, // 'student' | 'admin' | 'counsellor'
      fromName: me.name,
      avatar: me.avatar,
      body: body || '',
      attachment: attachment || null,
      ts: Date.now(),
    };
    append(threadId, msg);
    broadcast({ kind: 'message', threadId, msg });
    return msg;
  }

  function typing(threadId, isTyping) {
    broadcast({ kind: 'typing', threadId, from: me.role, typing: !!isTyping });
  }

  function on(type, cb) {
    if (handlers[type]) handlers[type].push(cb);
    return LiveChat;
  }

  function history(threadId) { return load(threadId); }

  function threads() {
    let idx = {};
    try { idx = JSON.parse(localStorage.getItem(INDEX_KEY) || '{}'); } catch {}
    return Object.entries(idx)
      .map(([threadId, v]) => ({ threadId, ...v }))
      .sort((a, b) => b.ts - a.ts);
  }

  return { init, open, send, typing, on, history, threads };
})();

window.LiveChat = LiveChat;
