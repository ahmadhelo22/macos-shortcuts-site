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
  const skeletonEl = document.getElementById('skeleton-detail');

  try {
    const response = await fetch(`../shortcuts.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const shortcuts = await response.json();
    shortcutItem = shortcuts.find((s) => s.slug === window.SHORTCUT_SLUG) || null;

    if (!shortcutItem) {
      skeletonEl.hidden = true;
      statusEl.textContent = STRINGS[lang.getLang()].notFound;
      statusEl.classList.add('error');
      statusEl.hidden = false;
      return;
    }

    skeletonEl.hidden = true;
    const detailCard = document.getElementById('detail-card');
    detailCard.hidden = false;
    detailCard.classList.add('animate-in');
    render();
  } catch (err) {
    skeletonEl.hidden = true;
    statusEl.textContent = STRINGS[lang.getLang()].error;
    statusEl.classList.add('error');
    statusEl.hidden = false;
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

  const imagesWrap = document.getElementById('shortcut-images');
  imagesWrap.innerHTML = '';
  const images = Array.isArray(shortcutItem.images) ? shortcutItem.images : [];
  if (images.length > 0) {
    imagesWrap.hidden = false;
    imagesWrap.classList.toggle('multi', images.length > 1);
    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
      img.loading = 'lazy';
      imagesWrap.appendChild(img);
    });
  } else {
    imagesWrap.hidden = true;
  }

  const details = currentLang === 'ar' ? shortcutItem.details_ar : shortcutItem.details_en;
  const detailsWrap = document.getElementById('shortcut-details');
  detailsWrap.innerHTML = '';
  if (details && details.trim()) {
    detailsWrap.hidden = false;
    const label = document.createElement('h3');
    label.className = 'details-label';
    label.textContent = t.detailsLabel;
    detailsWrap.appendChild(label);
    details.split('\n').filter((line) => line.trim()).forEach((paragraph) => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      detailsWrap.appendChild(p);
    });
  } else {
    detailsWrap.hidden = true;
  }

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
