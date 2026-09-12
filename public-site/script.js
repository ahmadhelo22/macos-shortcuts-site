let shortcutsData = [];
let lang = { getLang: () => 'ar' };

document.addEventListener('DOMContentLoaded', () => {
  lang = setupLangToggle((newLang) => {
    document.getElementById('site-title').textContent = STRINGS[newLang].title;
    document.getElementById('site-subtitle').textContent = STRINGS[newLang].subtitle;
    document.getElementById('site-footer-text').textContent = STRINGS[newLang].footer;

    const statusEl = document.getElementById('status');
    if (statusEl) {
      if (statusEl.classList.contains('error')) {
        statusEl.textContent = STRINGS[newLang].error;
      } else if (statusEl.classList.contains('empty-msg')) {
        statusEl.textContent = STRINGS[newLang].empty;
      } else {
        statusEl.textContent = STRINGS[newLang].loading;
      }
    }

    if (shortcutsData.length > 0) {
      renderShortcuts();
    }
  });

  loadShortcuts();
});

async function loadShortcuts() {
  const statusEl = document.getElementById('status');

  try {
    const response = await fetch(`shortcuts.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const shortcuts = await response.json();

    if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
      statusEl.textContent = STRINGS[lang.getLang()].empty;
      statusEl.classList.add('empty-msg');
      return;
    }

    shortcutsData = shortcuts;
    statusEl.remove();
    renderShortcuts();
  } catch (err) {
    statusEl.textContent = STRINGS[lang.getLang()].error;
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
  const currentLang = lang.getLang();
  const name = currentLang === 'ar' ? shortcut.name_ar : shortcut.name_en;
  const description = currentLang === 'ar' ? shortcut.description_ar : shortcut.description_en;
  const detailUrl = `shortcuts/${shortcut.slug}.html`;

  const card = document.createElement('article');
  card.className = 'card';

  const titleLink = document.createElement('a');
  titleLink.href = detailUrl;
  titleLink.className = 'card-title-link';

  const title = document.createElement('h2');
  title.textContent = name;
  titleLink.appendChild(title);
  card.appendChild(titleLink);

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
