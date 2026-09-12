const LANG_STORAGE_KEY = 'site_lang';

const STRINGS = {
  ar: {
    dir: 'rtl',
    title: 'macOS Shortcuts',
    subtitle: 'مجموعة شورت كاتس جاهزة للتحميل، كل وحدة بتفحص بيئتها وتصلّح نفسها تلقائياً',
    loading: 'جاري تحميل الشورت كاتس...',
    empty: 'لا يوجد شورت كاتس متاحة حالياً.',
    error: 'حدث خطأ أثناء تحميل الشورت كاتس.',
    download: 'تحميل',
    footer: 'صُنع بواسطة صاحب المشروع — بدون باك اند، بدون قاعدة بيانات.',
    toggleLabel: 'English'
  },
  en: {
    dir: 'ltr',
    title: 'macOS Shortcuts',
    subtitle: 'A collection of ready-to-download shortcuts, each one checks its environment and self-heals automatically',
    loading: 'Loading shortcuts...',
    empty: 'No shortcuts available right now.',
    error: 'Something went wrong while loading the shortcuts.',
    download: 'Download',
    footer: 'Made by the project owner — no backend, no database.',
    toggleLabel: 'العربية'
  }
};

let currentLang = 'ar';
let shortcutsData = [];

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // ignore (private browsing / disabled storage)
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  const t = STRINGS[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;

  document.getElementById('site-title').textContent = t.title;
  document.getElementById('site-subtitle').textContent = t.subtitle;
  document.getElementById('site-footer-text').textContent = t.footer;
  document.getElementById('lang-toggle').textContent = t.toggleLabel;

  const statusEl = document.getElementById('status');
  if (statusEl) {
    if (statusEl.classList.contains('error')) {
      statusEl.textContent = t.error;
    } else if (statusEl.classList.contains('empty-msg')) {
      statusEl.textContent = t.empty;
    } else {
      statusEl.textContent = t.loading;
    }
  }

  if (shortcutsData.length > 0) {
    renderShortcuts();
  }
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  const nextLang = currentLang === 'ar' ? 'en' : 'ar';
  safeStorageSet(LANG_STORAGE_KEY, nextLang);
  applyLanguage(nextLang);
});

async function loadShortcuts() {
  const statusEl = document.getElementById('status');
  const grid = document.getElementById('shortcuts-grid');

  try {
    const response = await fetch('shortcuts.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const shortcuts = await response.json();

    if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
      statusEl.textContent = STRINGS[currentLang].empty;
      statusEl.classList.add('empty-msg');
      return;
    }

    shortcutsData = shortcuts;
    statusEl.remove();
    renderShortcuts();
  } catch (err) {
    statusEl.textContent = STRINGS[currentLang].error;
    statusEl.classList.add('error');
    console.error('Failed to load shortcuts.json:', err);
  }
}

function renderShortcuts() {
  const grid = document.getElementById('shortcuts-grid');
  grid.innerHTML = '';
  shortcutsData.forEach((shortcut) => grid.appendChild(renderCard(shortcut)));
}

function renderCard(shortcut) {
  const card = document.createElement('article');
  card.className = 'card';

  const name = currentLang === 'ar' ? shortcut.name_ar : shortcut.name_en;
  const description = currentLang === 'ar' ? shortcut.description_ar : shortcut.description_en;

  const title = document.createElement('h2');
  title.textContent = name;
  card.appendChild(title);

  const descriptionEl = document.createElement('p');
  descriptionEl.textContent = description;
  card.appendChild(descriptionEl);

  if (Array.isArray(shortcut.requires) && shortcut.requires.length > 0) {
    const requiresWrap = document.createElement('div');
    requiresWrap.className = 'requires';
    shortcut.requires.forEach((tool) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = tool;
      requiresWrap.appendChild(tag);
    });
    card.appendChild(requiresWrap);
  }

  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'download-btn';
  downloadBtn.href = shortcut.file;
  downloadBtn.innerHTML = `<span class="arrow">&#8595;</span> ${STRINGS[currentLang].download}`;
  downloadBtn.setAttribute('download', '');
  downloadBtn.addEventListener('click', () => onDownloadClick(shortcut));
  card.appendChild(downloadBtn);

  return card;
}

function onDownloadClick(shortcut) {
  // مكان مخصص لتتبع التحميلات (Google Analytics 4) — يُستكمل في خطوة لاحقة من الخطة.
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = safeStorageGet(LANG_STORAGE_KEY);
  currentLang = savedLang === 'en' || savedLang === 'ar' ? savedLang : 'ar';
  applyLanguage(currentLang);
  loadShortcuts();
});
