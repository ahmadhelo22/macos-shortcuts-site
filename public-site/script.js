let shortcutsData = [];
let lang = { getLang: () => 'ar' };

document.addEventListener('DOMContentLoaded', () => {
  lang = setupLangToggle((newLang) => {
    document.getElementById('site-title').textContent = STRINGS[newLang].title;
    document.getElementById('site-subtitle').textContent = STRINGS[newLang].subtitle;
    document.getElementById('site-footer-text').textContent = STRINGS[newLang].footer;

    const statusEl = document.getElementById('status');
    if (!statusEl.hidden) {
      if (statusEl.classList.contains('error')) {
        statusEl.textContent = STRINGS[newLang].error;
      } else if (statusEl.classList.contains('empty-msg')) {
        statusEl.textContent = STRINGS[newLang].empty;
      }
    }

    if (shortcutsData.length > 0) {
      renderShortcuts();
    }
  });

  renderSkeletonCards();
  loadShortcuts();
});

function renderSkeletonCards(count = 3) {
  const grid = document.getElementById('shortcuts-grid');
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'card skeleton-card';
    card.innerHTML = `
      <div class="skeleton-block" style="width: 55%; height: 1.15rem;"></div>
      <div class="skeleton-block" style="width: 90%;"></div>
      <div class="skeleton-block" style="width: 70%;"></div>
      <div class="skeleton-block" style="width: 100%; height: 2.6rem;"></div>
    `;
    grid.appendChild(card);
  }
}

async function loadShortcuts() {
  const statusEl = document.getElementById('status');

  try {
    const response = await fetch(`shortcuts.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const shortcuts = await response.json();

    if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
      document.getElementById('shortcuts-grid').innerHTML = '';
      statusEl.textContent = STRINGS[lang.getLang()].empty;
      statusEl.classList.add('empty-msg');
      statusEl.hidden = false;
      return;
    }

    shortcutsData = shortcuts;
    renderShortcuts();
  } catch (err) {
    document.getElementById('shortcuts-grid').innerHTML = '';
    statusEl.textContent = STRINGS[lang.getLang()].error;
    statusEl.classList.add('error');
    statusEl.hidden = false;
    console.error('Failed to load shortcuts.json:', err);
  }
}

function renderShortcuts() {
  const grid = document.getElementById('shortcuts-grid');
  grid.innerHTML = '';
  shortcutsData.forEach((shortcut, index) => {
    const card = renderCard(shortcut);
    card.style.animationDelay = `${index * 60}ms`;
    grid.appendChild(card);
  });
}

function renderCard(shortcut) {
  const currentLang = lang.getLang();
  const name = currentLang === 'ar' ? shortcut.name_ar : shortcut.name_en;
  const description = currentLang === 'ar' ? shortcut.description_ar : shortcut.description_en;
  const detailUrl = `shortcuts/${shortcut.slug}.html`;

  const card = document.createElement('article');
  card.className = 'card animate-in';

  if (shortcut.thumbnail) {
    const thumb = document.createElement('img');
    thumb.className = 'card-thumbnail';
    thumb.src = `shortcuts/${shortcut.thumbnail}`;
    thumb.alt = name;
    thumb.loading = 'lazy';
    card.appendChild(thumb);
  }

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

  const viewBtn = document.createElement('a');
  viewBtn.className = 'view-btn';
  viewBtn.href = detailUrl;
  const arrow = currentLang === 'ar' ? '&#8592;' : '&#8594;';
  viewBtn.innerHTML = `<span class="arrow">${arrow}</span> ${STRINGS[currentLang].viewDetails}`;
  card.appendChild(viewBtn);

  return card;
}
