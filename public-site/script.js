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
      statusEl.textContent = 'لا يوجد شورت كاتس متاحة حالياً.';
      return;
    }

    statusEl.remove();
    shortcuts.forEach((shortcut) => grid.appendChild(renderCard(shortcut)));
  } catch (err) {
    statusEl.textContent = 'حدث خطأ أثناء تحميل الشورت كاتس.';
    statusEl.classList.add('error');
    console.error('Failed to load shortcuts.json:', err);
  }
}

function renderCard(shortcut) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = shortcut.name;
  card.appendChild(title);

  const description = document.createElement('p');
  description.textContent = shortcut.description;
  card.appendChild(description);

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
  downloadBtn.innerHTML = '<span class="arrow">&#8592;</span> تحميل';
  downloadBtn.setAttribute('download', '');
  downloadBtn.addEventListener('click', () => onDownloadClick(shortcut));
  card.appendChild(downloadBtn);

  return card;
}

function onDownloadClick(shortcut) {
  // مكان مخصص لتتبع التحميلات (Google Analytics 4) — يُستكمل في خطوة لاحقة من الخطة.
}

document.addEventListener('DOMContentLoaded', loadShortcuts);
