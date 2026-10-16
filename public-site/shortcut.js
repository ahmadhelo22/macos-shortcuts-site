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

    document.getElementById('shortcut-download').addEventListener('click', (e) => {
      celebrateDownload(e.currentTarget);
    });
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

  renderHotkey(t, currentLang);

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

  renderSetupNotice(t);

  const downloadBtn = document.getElementById('shortcut-download');
  downloadBtn.href = `../${shortcutItem.file}`;
  downloadBtn.innerHTML = `<span class="arrow">&#8595;</span> ${t.download}`;
}

// "⌃⌥⌘V" → keycaps, each with the key's name underneath.
function renderKeys(hotkey, t) {
  const wrap = document.createElement('div');
  wrap.className = 'hotkey-keys';
  wrap.dir = 'ltr';
  [...hotkey].forEach((ch, i) => {
    if (i > 0) {
      const plus = document.createElement('span');
      plus.className = 'hotkey-plus';
      plus.textContent = '+';
      wrap.appendChild(plus);
    }
    const key = document.createElement('kbd');
    key.className = 'hotkey-key';
    const sym = document.createElement('span');
    sym.className = 'hotkey-sym';
    sym.textContent = ch;
    key.appendChild(sym);
    const name = t.keyNames[ch];
    if (name) {
      const label = document.createElement('span');
      label.className = 'hotkey-name';
      label.textContent = name;
      key.appendChild(label);
    }
    wrap.appendChild(key);
  });
  return wrap;
}

// Keyboard shortcut box plus a step-by-step example, for shortcuts that
// assign themselves a hotkey (the `hotkey` and `example` fields).
function renderHotkey(t, lang) {
  let box = document.getElementById('hotkey-box');
  if (!shortcutItem.hotkey) {
    if (box) box.remove();
    return;
  }
  if (!box) {
    box = document.createElement('section');
    box.id = 'hotkey-box';
    box.className = 'hotkey-box';
    const details = document.getElementById('shortcut-details');
    details.parentNode.insertBefore(box, details);
  }
  box.innerHTML = '';

  const title = document.createElement('h3');
  title.className = 'hotkey-title';
  title.textContent = `⌨️ ${t.hotkeyTitle}`;
  box.appendChild(title);
  box.appendChild(renderKeys(shortcutItem.hotkey, t));

  [t.hotkeyAuto, t.hotkeyCheck].forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    box.appendChild(p);
  });
  const note = document.createElement('p');
  note.className = 'hotkey-note';
  note.textContent = t.hotkeyName;
  box.appendChild(note);

  const panel = document.createElement('img');
  panel.className = 'hotkey-panel';
  panel.src = `images/${shortcutItem.slug}/hotkey.jpg`;
  panel.alt = t.hotkeyImageAlt;
  panel.loading = 'lazy';
  box.appendChild(panel);

  const example = Array.isArray(shortcutItem.example) ? shortcutItem.example : [];
  if (example.length === 0) return;

  const exTitle = document.createElement('h3');
  exTitle.className = 'hotkey-title example-title';
  exTitle.textContent = `▶️ ${t.exampleTitle}`;
  box.appendChild(exTitle);

  const steps = document.createElement('ol');
  steps.className = 'example-steps';
  example.forEach((step) => {
    const li = document.createElement('li');
    const text = document.createElement('p');
    text.textContent = lang === 'ar' ? step.ar : step.en;
    li.appendChild(text);
    if (step.keys) li.appendChild(renderKeys(shortcutItem.hotkey, t));
    if (step.image) {
      const img = document.createElement('img');
      img.src = step.image;
      img.alt = text.textContent;
      img.loading = 'lazy';
      li.appendChild(img);
    }
    steps.appendChild(li);
  });
  box.appendChild(steps);
}

// Every shortcut on the site runs a shell script, which the Shortcuts app
// blocks until "Allow Running Scripts" is on, so show how to enable it
// right above the download button.
function renderSetupNotice(t) {
  const SETTING = 'Allow Running Scripts';
  let notice = document.getElementById('setup-notice');
  if (!notice) {
    notice = document.createElement('section');
    notice.id = 'setup-notice';
    notice.className = 'setup-notice';
    const downloadBtn = document.getElementById('shortcut-download');
    downloadBtn.parentNode.insertBefore(notice, downloadBtn);
  }
  notice.innerHTML = '';

  const settingName = () => {
    const span = document.createElement('span');
    span.className = 'setup-setting';
    span.dir = 'ltr';
    span.textContent = SETTING;
    return span;
  };

  const title = document.createElement('h3');
  title.className = 'setup-title';
  title.append(`⚠️ ${t.setupTitle} `, settingName());
  notice.appendChild(title);

  const intro = document.createElement('p');
  intro.textContent = t.setupIntro;
  notice.appendChild(intro);

  const steps = document.createElement('ol');
  steps.className = 'setup-steps';
  t.setupSteps.forEach((text, i) => {
    const li = document.createElement('li');
    const body = document.createElement('span');
    body.textContent = text;
    if (i === t.setupSteps.length - 1) body.append(' ', settingName());
    li.appendChild(body);
    steps.appendChild(li);
  });
  notice.appendChild(steps);

  const images = document.createElement('div');
  images.className = 'setup-images';
  ['allow-scripts-1-settings.jpg', 'allow-scripts-2-advanced.jpg'].forEach((file, i) => {
    const img = document.createElement('img');
    img.src = `../images/setup/${file}`;
    img.alt = t.setupImageAlt[i];
    img.loading = 'lazy';
    images.appendChild(img);
  });
  notice.appendChild(images);
}

function celebrateDownload(button) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors = ['#f2765e', '#315b8c', '#413333', '#d95f48'];
  const rect = button.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const count = 14;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'confetti-particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 60 + Math.random() * 50;
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.background = colors[i % colors.length];
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
  }
}
