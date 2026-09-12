let shortcutItem = null;
let lang = { getLang: () => 'ar' };

document.addEventListener('DOMContentLoaded', () => {
  lang = setupLangToggle((newLang) => {
    document.getElementById('site-footer-text').textContent = STRINGS[newLang].footer;
    document.getElementById('back-link').textContent = STRINGS[newLang].backLink;
    render();
  });

  loadShortcut();
});

async function loadShortcut() {
  const statusEl = document.getElementById('status');

  try {
    const response = await fetch(`../shortcuts.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const shortcuts = await response.json();
    shortcutItem = shortcuts.find((s) => s.slug === window.SHORTCUT_SLUG) || null;

    if (!shortcutItem) {
      statusEl.textContent = STRINGS[lang.getLang()].notFound;
      statusEl.classList.add('error');
      return;
    }

    statusEl.remove();
    document.getElementById('detail-card').hidden = false;
    render();
  } catch (err) {
    statusEl.textContent = STRINGS[lang.getLang()].error;
    statusEl.classList.add('error');
    console.error('Failed to load shortcuts.json:', err);
  }
}

function render() {
  if (!shortcutItem) return;
  const currentLang = lang.getLang();
  const t = STRINGS[currentLang];

  const name = currentLang === 'ar' ? shortcutItem.name_ar : shortcutItem.name_en;
  const description = currentLang === 'ar' ? shortcutItem.description_ar : shortcutItem.description_en;

  document.title = name;
  document.getElementById('shortcut-title').textContent = name;
  document.getElementById('shortcut-description').textContent = description;
  document.getElementById('requires-label').textContent = t.requiresLabel;

  const requiresWrap = document.getElementById('shortcut-requires');
  requiresWrap.innerHTML = '';
  (shortcutItem.requires || []).forEach((tool) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tool;
    requiresWrap.appendChild(tag);
  });

  const downloadBtn = document.getElementById('shortcut-download');
  downloadBtn.href = shortcutItem.file;
  downloadBtn.innerHTML = `<span class="arrow">&#8595;</span> ${t.download}`;
}
