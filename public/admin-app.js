// ============================================================================
//  Admin console logic: routing, tables, universities CRUD, live chat.
// ============================================================================
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ME = { role: 'admin', userId: 'admin', name: 'Vayas team', avatar: '' };

  // ── Toast ─────────────────────────────────────────────────────
  let toastTimer;
  function toast(msg) {
    $('#toastMsg').textContent = msg;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2400);
  }
  window.toast = toast;

  // ── View routing ──────────────────────────────────────────────
  const titles = {
    overview: 'Console', clients: 'Clients', applications: 'Applications',
    messages: 'Messages', universities: 'Universities', invoices: 'Invoices',
    counsellors: 'Team', settings: 'Settings',
  };
  function setView(name) {
    $$('.nav-item[data-view]').forEach((n) => n.classList.toggle('active', n.dataset.view === name));
    $$('.view[data-view]').forEach((v) => v.classList.toggle('active', v.dataset.view === name));
    $('#pageTitle').innerHTML = name === 'overview' ? 'Console' : `<em>${titles[name]}</em>`;
    $('#content').scrollTop = 0;
    if (name === 'messages') setTimeout(scrollBottom, 50);
  }
  $$('.nav-item[data-view]').forEach((n) => n.addEventListener('click', () => setView(n.dataset.view)));

  // ── Render: Clients ───────────────────────────────────────────
  function clientRow(c) {
    return `<div class="t-row body" style="grid-template-columns: 2fr 1.4fr 1fr 1fr 90px;" data-client="${c.id}" data-stage="${c.stage}" data-name="${esc(c.name)} ${esc(c.email)}">
      <div class="cli-cell"><div class="av" style="background-image:url('${c.avatar}')"></div><div style="min-width:0"><div class="nm">${esc(c.name)}</div><div class="em">${esc(c.course)}</div></div></div>
      <div>${esc(c.counsellor)}</div>
      <div>${c.apps} active</div>
      <div><span class="status ${c.stage === 'offer' ? 'offer' : c.stage === 'new' ? 'submitted' : 'active'}"><span class="dot"></span> ${c.stage === 'offer' ? 'Has offer' : c.stage === 'new' ? 'New' : 'Active'}</span></div>
      <div class="row-actions"><button class="mini-btn act-msg" title="Message" data-client="${c.id}"><i class="ti ti-message"></i></button><button class="mini-btn act-view" title="View" data-client="${c.id}"><i class="ti ti-arrow-right"></i></button></div>
    </div>`;
  }
  function renderClients() {
    $('#clientRows').innerHTML = AdminData.clients.length
      ? AdminData.clients.map(clientRow).join('')
      : `<div class="t-row body" style="grid-template-columns:1fr;justify-items:center;padding:42px 20px;color:var(--muted)"><div style="text-align:center"><i class="ti ti-users" style="font-size:30px;display:block;margin-bottom:8px;color:var(--muted-2)"></i>No clients yet. When a student signs up or you add one, they appear here.</div></div>`;
  }

  // ── Render: Applications ──────────────────────────────────────
  function appRow(a) {
    const label = { 'in-review': 'In review', offer: 'Offer', submitted: 'Submitted', draft: 'Draft' }[a.status];
    return `<div class="t-row body" style="grid-template-columns: 1.6fr 2fr 1fr 1fr 90px;" data-status="${a.status}" data-name="${esc(a.client)} ${esc(a.uni)} ${esc(a.course)}">
      <div class="cli-cell"><div class="uni-logo-sm">${esc(a.logo)}</div><div style="min-width:0"><div class="nm">${esc(a.client)}</div><div class="em">${esc(a.uni)}</div></div></div>
      <div><div style="font-weight:500">${esc(a.course)}</div><div style="font-size:12px;color:var(--muted)">${esc(a.uni)}</div></div>
      <div>${esc(a.intake)}</div>
      <div><span class="status ${a.status}"><span class="dot"></span> ${label}</span></div>
      <div class="row-actions"><button class="mini-btn" title="Open"><i class="ti ti-arrow-right"></i></button></div>
    </div>`;
  }
  function renderApps() {
    $('#appRows').innerHTML = AdminData.applications.length
      ? AdminData.applications.map(appRow).join('')
      : `<div class="t-row body" style="grid-template-columns:1fr;justify-items:center;padding:42px 20px;color:var(--muted)"><div style="text-align:center"><i class="ti ti-files" style="font-size:30px;display:block;margin-bottom:8px;color:var(--muted-2)"></i>No applications yet — they appear here once you start filing for clients.</div></div>`;
  }

  // ── Render: Invoices ──────────────────────────────────────────
  function invRow(i) {
    return `<div class="t-row body" style="grid-template-columns: 1.2fr 1.6fr 1.4fr 1fr 1fr 60px;" data-st="${i.status}" data-name="${esc(i.number)} ${esc(i.client)} ${esc(i.item)}">
      <div style="font-weight:600">${esc(i.number)}</div>
      <div><div style="font-weight:500">${esc(i.client)}</div><div style="font-size:12px;color:var(--muted)">${esc(i.item)}</div></div>
      <div style="color:var(--muted)">${esc(i.issued)}</div>
      <div style="font-family:var(--serif);font-size:18px">${esc(i.amount)}</div>
      <div><span class="status ${i.status}"><span class="dot"></span> ${i.status === 'paid' ? 'Paid' : 'Due'}</span></div>
      <div class="row-actions"><button class="mini-btn" title="Download"><i class="ti ti-download"></i></button></div>
    </div>`;
  }
  function renderInvoices() {
    $('#invRows').innerHTML = AdminData.invoices.length
      ? AdminData.invoices.map(invRow).join('')
      : `<div class="t-row body" style="grid-template-columns:1fr;justify-items:center;padding:42px 20px;color:var(--muted)"><div style="text-align:center"><i class="ti ti-receipt" style="font-size:30px;display:block;margin-bottom:8px;color:var(--muted-2)"></i>No invoices yet.</div></div>`;
  }

  // ── Render: Counsellors ───────────────────────────────────────
  function renderCounsellors() {
    if (!AdminData.counsellors.length) {
      $('#counsRows').innerHTML = `<div class="t-row body" style="grid-template-columns:1fr;justify-items:center;padding:42px 20px;color:var(--muted)"><div style="text-align:center"><i class="ti ti-user-star" style="font-size:30px;display:block;margin-bottom:8px;color:var(--muted-2)"></i>Just you for now — founder-led, as the website says.</div></div>`;
      return;
    }
    $('#counsRows').innerHTML = AdminData.counsellors.map((c) => `
      <div class="t-row body" style="grid-template-columns: 2fr 1.6fr 1fr 1fr 90px;">
        <div class="cli-cell"><div class="av" style="background-image:url('${c.avatar}')"></div><div class="nm">${esc(c.name)}</div></div>
        <div>${esc(c.specialty)}</div>
        <div>${c.clients} clients</div>
        <div><span class="status ${c.online ? 'active' : 'draft'}"><span class="dot"></span> ${c.online ? 'Online' : 'Offline'}</span></div>
        <div class="row-actions"><button class="mini-btn" title="Edit"><i class="ti ti-pencil"></i></button></div>
      </div>`).join('');
  }

  // ── Render: Universities (CRUD) ───────────────────────────────
  function uniCard(u) {
    return `<div class="uni-admin" data-id="${u.id}" data-country="${u.cc}" data-name="${esc(u.name)} ${esc(u.city)}">
      <div class="ph" style="background:${u.photo ? `url('${u.photo}') center/cover` : (u.cc === 'cz' ? 'linear-gradient(150deg,#8e3434,#2c1212)' : 'linear-gradient(150deg,#44506e,#181d2c)')}"><span class="flag">${u.flag} ${esc(u.city)}</span></div>
      <div class="body">
        <div class="nm">${esc(u.name)}</div>
        <div class="lo">Founded ${u.founded} · ${esc(u.country)}</div>
        <div class="meta-row"><span class="chip">Rank #${u.ranking}</span>${u.acceptance ? `<span class="chip">${u.acceptance}% accept</span>` : ''}<span class="chip">${esc(u.tuition)}</span></div>
        <div class="acts">
          <button class="btn btn-ghost btn-sm act-edit" data-id="${u.id}"><i class="ti ti-pencil"></i> Edit</button>
          <button class="btn btn-ghost btn-sm act-del" data-id="${u.id}"><i class="ti ti-trash"></i></button>
        </div>
      </div>
    </div>`;
  }
  function renderUnis() {
    const list = AdminData.getUniversities();
    $('#uniGrid').innerHTML = list.length
      ? list.map(uniCard).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No universities yet — add your first.</div>';
    applyUniFilter();
  }

  // ── Modals ────────────────────────────────────────────────────
  const backdrop = $('#modalBackdrop');
  const modalEl = $('#modalEl');
  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => (modalEl.innerHTML = ''), 300);
  }
  function openModalHTML(html, wide) {
    modalEl.innerHTML = html;
    modalEl.classList.toggle('wide', !!wide);
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalEl.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  }
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal(); });

  // University add/edit form
  function uniForm(u) {
    const v = u || { name: '', logo: '', country: '', cc: 'uk', flag: '<img class="flag-img" src="assets/flags/gb.svg" alt="" />', city: '', founded: 2000, ranking: 50, acceptance: 30, tuition: '', photo: '' };
    const isEdit = !!u;
    return `
      <div class="modal-head">
        <div class="titles"><h3>${isEdit ? 'Edit' : 'Add'} <em>university</em></h3><p>${isEdit ? 'Update this institution in the catalogue.' : 'Add a new institution students can apply through.'}</p></div>
        <button class="modal-close" data-close><i class="ti ti-x"></i></button>
      </div>
      <div class="modal-body">
        <div class="ff"><label>University name</label><input id="u_name" value="${esc(v.name)}" placeholder="e.g. University of Cambridge" /></div>
        <div class="ff-row">
          <div class="ff"><label>Monogram (card)</label><input id="u_logo" value="${esc(v.logo)}" placeholder="e.g. CAM" maxlength="5" /></div>
          <div class="ff"><label>City</label><input id="u_city" value="${esc(v.city)}" placeholder="Cambridge" /></div>
        </div>
        <div class="ff-row">
          <div class="ff"><label>Country</label><input id="u_country" value="${esc(v.country)}" placeholder="United Kingdom" /></div>
          <div class="ff"><label>Country code</label>
            <select id="u_cc">
              ${[['uk', 'UK'], ['us', 'US'], ['ca', 'Canada'], ['au', 'Australia'], ['ie', 'Ireland'], ['de', 'Germany'], ['cz', 'Czech Republic'], ['ch', 'Switzerland'], ['nz', 'New Zealand'], ['fr', 'France'], ['nl', 'Netherlands']]
                .map(([code, lbl]) => `<option value="${code}" ${v.cc === code ? 'selected' : ''}>${lbl}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="ff-row-3">
          <div class="ff"><label>Founded</label><input id="u_founded" type="number" value="${v.founded}" /></div>
          <div class="ff"><label>World ranking</label><input id="u_ranking" type="number" value="${v.ranking}" /></div>
          <div class="ff"><label>Acceptance %</label><input id="u_acceptance" type="number" value="${v.acceptance}" /></div>
        </div>
        <div class="ff-row">
          <div class="ff"><label>Tuition label</label><input id="u_tuition" value="${esc(v.tuition)}" placeholder="£36k/yr" /></div>
          <div class="ff"><label>Photo URL</label><input id="u_photo" value="${esc(v.photo)}" placeholder="https://…" /></div>
        </div>
      </div>
      <div class="modal-foot">
        ${isEdit ? '' : ''}
        <button class="btn btn-ghost" data-close>Cancel</button>
        <button class="btn btn-dark" id="u_save"><i class="ti ti-check"></i> ${isEdit ? 'Save changes' : 'Add university'}</button>
      </div>`;
  }
  const FLAG_CODES = { uk: 'gb', us: 'us', ca: 'ca', au: 'au', ie: 'ie', de: 'de', ch: 'ch', nz: 'nz', fr: 'fr', nl: 'nl', cz: 'cz' };
  const flagFor = (cc) => FLAG_CODES[cc] ? `<img class="flag-img" src="assets/flags/${FLAG_CODES[cc]}.svg" alt="" />` : '';

  function readUniForm() {
    const cc = $('#u_cc').value;
    return {
      name: $('#u_name').value.trim(),
      logo: ($('#u_logo').value.trim() || $('#u_name').value.trim().slice(0, 3)).toUpperCase(),
      country: $('#u_country').value.trim(),
      cc, flag: flagFor(cc),
      city: $('#u_city').value.trim(),
      founded: Number($('#u_founded').value) || 2000,
      ranking: Number($('#u_ranking').value) || 999,
      acceptance: Number($('#u_acceptance').value) || 0,
      tuition: $('#u_tuition').value.trim() || '—',
      photo: $('#u_photo').value.trim() || '',
    };
  }

  function openAddUni() {
    openModalHTML(uniForm(null));
    $('#u_save').addEventListener('click', () => {
      const data = readUniForm();
      if (!data.name) { toast('Name is required'); return; }
      AdminData.addUniversity(data);
      renderUnis();
      closeModal();
      toast('University added');
    });
  }
  function openEditUni(id) {
    const u = AdminData.getUniversities().find((x) => x.id === id);
    if (!u) return;
    openModalHTML(uniForm(u));
    $('#u_save').addEventListener('click', () => {
      AdminData.updateUniversity(id, readUniForm());
      renderUnis();
      closeModal();
      toast('University updated');
    });
  }
  function confirmDeleteUni(id) {
    const u = AdminData.getUniversities().find((x) => x.id === id);
    if (!u) return;
    openModalHTML(`
      <div class="modal-head"><div class="titles"><h3>Delete <em>${esc(u.name)}</em>?</h3><p>This removes it from the catalogue. Students can no longer apply through it.</p></div><button class="modal-close" data-close><i class="ti ti-x"></i></button></div>
      <div class="modal-body"><div class="cd-li"><div class="uni-logo-sm">${esc(u.logo)}</div><div class="l"><div class="t">${esc(u.name)}</div><div class="s">${u.flag} ${esc(u.city)} · Rank #${u.ranking}</div></div></div></div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" id="u_del"><i class="ti ti-trash"></i> Delete university</button></div>`);
    $('#u_del').addEventListener('click', () => { AdminData.deleteUniversity(id); renderUnis(); closeModal(); toast('University deleted'); });
  }

  // Client detail modal
  function openClientDetail(id) {
    const c = AdminData.clients.find((x) => x.id === id);
    if (!c) return;
    const apps = AdminData.applications.filter((a) => a.cid === id);
    const inv = AdminData.invoices.filter((i) => i.client === c.name);
    openModalHTML(`
      <div class="modal-head"><div class="titles"><h3>Client profile</h3></div><button class="modal-close" data-close><i class="ti ti-x"></i></button></div>
      <div class="modal-body">
        <div class="cd-head"><div class="av" style="background-image:url('${c.avatar}')"></div><div><div class="nm">${esc(c.name)}</div><div class="em">${esc(c.email)} · ${esc(c.course)}</div></div></div>
        <div class="cd-stats">
          <div class="cd-stat"><div class="l">Applications</div><div class="v">${c.stats.applications}</div></div>
          <div class="cd-stat"><div class="l">Offers</div><div class="v">${c.stats.offers}</div></div>
          <div class="cd-stat"><div class="l">Documents</div><div class="v">${c.stats.documents}</div></div>
        </div>
        <div class="cd-sec-title">Applications</div>
        <div class="cd-list">${apps.map((a) => `<div class="cd-li"><div class="uni-logo-sm">${esc(a.logo)}</div><div class="l"><div class="t">${esc(a.uni)}</div><div class="s">${esc(a.course)} · ${esc(a.intake)}</div></div><span class="status ${a.status}"><span class="dot"></span> ${a.status.replace('-', ' ')}</span></div>`).join('') || '<div class="s" style="color:var(--muted)">No applications yet.</div>'}</div>
        <div class="cd-sec-title">Invoices</div>
        <div class="cd-list">${inv.map((i) => `<div class="cd-li"><div class="l"><div class="t">${esc(i.number)} · ${esc(i.amount)}</div><div class="s">${esc(i.item)}</div></div><span class="status ${i.status}"><span class="dot"></span> ${i.status}</span></div>`).join('') || '<div class="s" style="color:var(--muted)">No invoices.</div>'}</div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Close</button><button class="btn btn-dark" id="cd_msg"><i class="ti ti-message"></i> Message ${esc(c.name.split(' ')[0])}</button></div>`, true);
    $('#cd_msg').addEventListener('click', () => { closeModal(); setView('messages'); openThread(c.id); });
  }

  // Generic info modals (broadcast, addClient, newInvoice, etc.)
  const genericModals = {
    addClient: ['Add a <em>client</em>', 'Onboard a new student to your portfolio.', `
      <div class="ff"><label>Full name</label><input placeholder="Student name" /></div>
      <div class="ff-row"><div class="ff"><label>Email</label><input type="email" placeholder="student@email.com" /></div><div class="ff"><label>Assign counsellor</label><select><option>Riya Sharma</option><option>Marco Bellini</option><option>Sara Okonkwo</option></select></div></div>
      <div class="ff"><label>Target destination</label><input placeholder="e.g. UK, Canada" /></div>`, 'Client added — invite sent'],
    broadcast: ['Send a <em>broadcast</em>', 'Message all active clients at once.', `
      <div class="ff"><label>Audience</label><select><option>All active clients (6)</option><option>Clients with offers (2)</option><option>New clients (2)</option></select></div>
      <div class="ff"><label>Message</label><textarea placeholder="Type your announcement…" style="min-height:120px"></textarea></div>`, 'Broadcast sent to 6 clients'],
    newInvoice: ['New <em>invoice</em>', 'Bill a client for a service.', `
      <div class="ff"><label>Client</label><select>${AdminData.clients.map((c) => `<option>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="ff"><label>Description</label><input placeholder="e.g. Application service fee" /></div>
      <div class="ff-row"><div class="ff"><label>Amount</label><input placeholder="$1,200" /></div><div class="ff"><label>Due date</label><input type="date" /></div></div>`, 'Invoice created & sent'],
    newCounsellor: ['Add a <em>counsellor</em>', 'Invite a team member.', `
      <div class="ff"><label>Name</label><input placeholder="Team member name" /></div>
      <div class="ff"><label>Specialty</label><input placeholder="e.g. Visas & documentation" /></div>`, 'Invitation sent'],
    addCounsellor: ['Add a <em>counsellor</em>', 'Invite a team member.', `
      <div class="ff"><label>Name</label><input placeholder="Team member name" /></div>
      <div class="ff"><label>Specialty</label><input placeholder="e.g. Visas & documentation" /></div>`, 'Invitation sent'],
    exportApps: ['Export <em>applications</em>', 'Download a CSV of all applications.', `
      <div class="ff"><label>Format</label><select><option>CSV</option><option>Excel (.xlsx)</option><option>PDF report</option></select></div>
      <div class="ff"><label>Include</label><select><option>All applications</option><option>Active only</option><option>This month</option></select></div>`, 'Export ready — downloading'],
  };
  function openGeneric(key) {
    const m = genericModals[key];
    if (!m) return;
    openModalHTML(`
      <div class="modal-head"><div class="titles"><h3>${m[0]}</h3><p>${m[1]}</p></div><button class="modal-close" data-close><i class="ti ti-x"></i></button></div>
      <div class="modal-body">${m[2]}</div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-dark" data-close id="gen_ok"><i class="ti ti-check"></i> Confirm</button></div>`);
    $('#gen_ok').addEventListener('click', () => toast(m[3]));
  }

  // ── Global click delegation ───────────────────────────────────
  document.addEventListener('click', (e) => {
    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) {
      const k = modalBtn.dataset.modal;
      if (k === 'clientDetail') openClientDetail(currentThread);
      else openGeneric(k);
      return;
    }
    const edit = e.target.closest('.act-edit'); if (edit) { openEditUni(Number(edit.dataset.id)); return; }
    const del = e.target.closest('.act-del'); if (del) { confirmDeleteUni(Number(del.dataset.id)); return; }
    const msg = e.target.closest('.act-msg'); if (msg) { setView('messages'); openThread(msg.dataset.client); return; }
    const viewC = e.target.closest('.act-view'); if (viewC) { openClientDetail(viewC.dataset.client); return; }
    const cliRow = e.target.closest('.t-row.body[data-client]'); if (cliRow && !e.target.closest('.row-actions')) { openClientDetail(cliRow.dataset.client); return; }
  });
  $('#addUniBtn').addEventListener('click', openAddUni);

  // ── Filters ───────────────────────────────────────────────────
  function wireFilter(barSel, rowsSel, chipAttr, matchFn) {
    const bar = $(barSel);
    if (!bar) return;
    const search = bar.querySelector('input');
    let key = 'all';
    function apply() {
      const q = (search?.value || '').trim().toLowerCase();
      $$(rowsSel).forEach((row) => {
        const okKey = key === 'all' || matchFn(row, key);
        const okText = !q || (row.dataset.name || row.textContent).toLowerCase().includes(q);
        row.style.display = okKey && okText ? '' : 'none';
      });
    }
    bar.querySelectorAll('.filter-chip').forEach((ch) =>
      ch.addEventListener('click', () => {
        bar.querySelectorAll('.filter-chip').forEach((x) => x.classList.remove('active'));
        ch.classList.add('active');
        key = ch.dataset[chipAttr];
        apply();
      })
    );
    if (search) search.addEventListener('input', apply);
    return apply;
  }
  let applyUniFilter = () => {};

  function wireAllFilters() {
    wireFilter('#clientFilter', '#clientRows .t-row.body', 'stage', (r, k) => r.dataset.stage === k);
    wireFilter('#appFilter', '#appRows .t-row.body', 'status', (r, k) => r.dataset.status === k);
    wireFilter('#invFilter', '#invRows .t-row.body', 'st', (r, k) => r.dataset.st === k);
    applyUniFilter = wireFilter('#uniFilter', '#uniGrid .uni-admin', 'country', (r, k) => r.dataset.country === k) || (() => {});
  }

  // Global topbar search → route to active view's local search
  $('#globalSearch').addEventListener('input', () => {
    const q = $('#globalSearch').value;
    const active = $('.view.active');
    const local = active && active.querySelector('.filter-search input');
    if (local) { local.value = q; local.dispatchEvent(new Event('input')); }
  });

  // Live chat removed — real client messaging ships with the Supabase data layer.
  function openThread() {}
  function scrollBottom() {}
  function updateUnreadBadge() {
    const b = $('#msgBadge'); if (b) { b.textContent = ''; b.style.display = 'none'; }
    const k = $('#kpiUnread'); if (k) k.textContent = '0';
  }

  // ── Boot ──────────────────────────────────────────────────────
  renderClients();
  renderApps();
  renderInvoices();
  renderCounsellors();
  renderUnis();
  wireAllFilters();
  updateUnreadBadge();
})();
