const DEFAULT_API_URL = 'http://localhost:3000';

const $ = (id) => document.getElementById(id);

// ── Storage helpers ──────────────────────────────────────────
function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiUrl', 'authToken'], (r) => {
      resolve({ apiUrl: r.apiUrl || DEFAULT_API_URL, token: r.authToken || '' });
    });
  });
}

// Incremented whenever the user takes an explicit action, so stale init() calls don't override the UI.
let initGeneration = 0;

// ── UI state ──────────────────────────────────────────────────
function showSection(name) {
  ['auth-section', 'settings-section', 'main-section'].forEach(id => {
    $(id).classList.toggle('hidden', id !== name);
  });
}

function showStatus(msg, type) {
  const el = $('status');
  el.textContent = msg;
  el.className = `status ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// ── Tab switching ─────────────────────────────────────────────
let activeTab = 'save';

function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  $('tab-save').classList.toggle('hidden', tabName !== 'save');
  $('tab-browse').classList.toggle('hidden', tabName !== 'browse');
  if (tabName === 'browse') {
    loadBookmarks();
  }
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ── Load categories into select ───────────────────────────────
async function loadCategories(apiUrl, token) {
  try {
    const res = await fetch(`${apiUrl}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const cats = await res.json();
    const sel = $('category');
    sel.innerHTML = '<option value="">— None —</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon || '📁'} ${c.name}`;
      sel.appendChild(opt);
    });
  } catch {}
}

// ── Load bookmarks list ───────────────────────────────────────
let searchTimeout = null;

async function loadBookmarks() {
  const { apiUrl, token } = await getConfig();
  const list = $('bookmarks-list');
  const search = $('search-input').value.trim();
  list.innerHTML = '<p class="list-hint">Loading…</p>';

  try {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${apiUrl}/bookmarks${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bookmarks = await res.json();

    if (!bookmarks.length) {
      list.innerHTML = '<p class="list-hint">No bookmarks found.</p>';
      return;
    }

    list.innerHTML = '';
    bookmarks.forEach(bm => {
      const item = document.createElement('a');
      item.className = 'bookmark-item';
      item.href = bm.url;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.title = bm.url;

      const favicon = document.createElement('img');
      favicon.className = 'bm-favicon';
      favicon.width = 16;
      favicon.height = 16;
      if (bm.favicon) {
        favicon.src = bm.favicon;
        favicon.onerror = () => { favicon.src = ''; favicon.style.display = 'none'; };
      } else {
        favicon.style.display = 'none';
      }

      const info = document.createElement('div');
      info.className = 'bm-info';

      const title = document.createElement('span');
      title.className = 'bm-title';
      title.textContent = bm.title || bm.url;

      const url = document.createElement('span');
      url.className = 'bm-url';
      url.textContent = bm.url;

      info.appendChild(title);
      info.appendChild(url);
      item.appendChild(favicon);
      item.appendChild(info);
      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = `<p class="list-hint error">Error: ${err.message}</p>`;
  }
}

$('search-input').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadBookmarks, 300);
});

// ── Init ──────────────────────────────────────────────────────
async function init() {
  const gen = ++initGeneration;
  const { apiUrl, token } = await getConfig();
  if (gen !== initGeneration) return;

  $('dashboard-link').href = apiUrl;

  if (!token) {
    showSection('auth-section');
    return;
  }

  // Verify token is still valid
  try {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('invalid');
  } catch {
    if (gen !== initGeneration) return;
    showSection('auth-section');
    return;
  }

  if (gen !== initGeneration) return;
  showSection('main-section');

  // Fill current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    $('title').value = tab.title || '';
    $('url').value = tab.url || '';
  }

  await loadCategories(apiUrl, token);

  if (activeTab === 'browse') {
    loadBookmarks();
  }
}

// ── Save bookmark ─────────────────────────────────────────────
async function saveBookmark() {
  const { apiUrl, token } = await getConfig();
  const url = $('url').value.trim();
  const title = $('title').value.trim();
  if (!url || !title) { showStatus('URL and title are required', 'error'); return; }

  const btn = $('save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const body = {
      url, title,
      description: $('description').value.trim() || undefined,
      tags: $('tags').value.trim() || undefined,
      favicon: tab?.favIconUrl || undefined,
      categoryId: $('category').value ? Number($('category').value) : undefined,
    };
    const res = await fetch(`${apiUrl}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
    showStatus('Bookmark saved!', 'success');
    $('description').value = '';
    $('tags').value = '';
    $('category').value = '';
  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Bookmark';
  }
}

// ── Event listeners ───────────────────────────────────────────
$('login-btn').addEventListener('click', async () => {
  const { apiUrl } = await getConfig();
  chrome.tabs.create({ url: `${apiUrl}/auth/google?source=extension` });
  window.close();
});

$('settings-btn').addEventListener('click', async () => {
  initGeneration++;
  const { apiUrl } = await getConfig();
  $('api-url').value = apiUrl;
  $('settings-status').classList.add('hidden');
  showSection('settings-section');
});

$('cancel-settings-btn').addEventListener('click', init);

$('save-settings-btn').addEventListener('click', async () => {
  const val = $('api-url').value.trim().replace(/\/$/, '');
  if (!val) return;
  await new Promise(r => chrome.storage.local.set({ apiUrl: val }, r));
  const el = $('settings-status');
  el.textContent = 'Settings saved!';
  el.className = 'status success';
  el.classList.remove('hidden');
  setTimeout(() => { el.classList.add('hidden'); init(); }, 1500);
});

$('logout-btn').addEventListener('click', async () => {
  await new Promise(r => chrome.storage.local.remove(['authToken'], r));
  init();
});

$('save-btn').addEventListener('click', saveBookmark);

init();
