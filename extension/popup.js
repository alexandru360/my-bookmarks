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

// ── Load categories into select ───────────────────────────────
async function loadCategories(apiUrl, token) {
  try {
    const res = await fetch(`${apiUrl}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const cats = await res.json();
    const sel = $('category');
    // Keep the "None" option
    sel.innerHTML = '<option value="">— None —</option>';
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon || '📁'} ${c.name}`;
      sel.appendChild(opt);
    });
  } catch {}
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  const { apiUrl, token } = await getConfig();
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
    showSection('auth-section');
    return;
  }

  showSection('main-section');

  // Fill current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    $('title').value = tab.title || '';
    $('url').value = tab.url || '';
  }

  await loadCategories(apiUrl, token);
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
  const { apiUrl } = await getConfig();
  $('api-url').value = apiUrl;
  showSection('settings-section');
});

$('cancel-settings-btn').addEventListener('click', init);

$('save-settings-btn').addEventListener('click', async () => {
  const val = $('api-url').value.trim().replace(/\/$/, '');
  if (!val) return;
  await new Promise(r => chrome.storage.local.set({ apiUrl: val }, r));
  init();
});

$('logout-btn').addEventListener('click', async () => {
  await new Promise(r => chrome.storage.local.remove(['authToken'], r));
  init();
});

$('save-btn').addEventListener('click', saveBookmark);

init();
