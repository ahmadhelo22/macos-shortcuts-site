const LANG_STORAGE_KEY = 'site_lang';

const STRINGS = {
  ar: {
    dir: 'rtl',
    title: 'macOS Shortcuts',
    subtitle: 'مجموعة شورت كاتس جاهزة للتحميل، كل وحدة بتفحص بيئتها وتصلّح نفسها تلقائياً',
    loading: 'جاري تحميل الشورت كاتس...',
    empty: 'لا يوجد شورت كاتس متاحة حالياً.',
    error: 'حدث خطأ أثناء تحميل الشورت كاتس.',
    notFound: 'هذا الشورت كات غير موجود.',
    download: 'تحميل',
    viewDetails: 'عرض التفاصيل',
    detailsLabel: 'شرح تفصيلي',
    requiresLabel: 'الأدوات المطلوبة',
    backLink: '→ الرجوع لكل الشورت كاتس',
    footer: 'جميع الحقوق محفوظة لدى Ahmad Alhelo',
    toggleLabel: 'English'
  },
  en: {
    dir: 'ltr',
    title: 'macOS Shortcuts',
    subtitle: 'A collection of ready-to-download shortcuts, each one checks its environment and self-heals automatically',
    loading: 'Loading shortcuts...',
    empty: 'No shortcuts available right now.',
    error: 'Something went wrong while loading the shortcuts.',
    notFound: 'This shortcut could not be found.',
    download: 'Download',
    viewDetails: 'View Details',
    detailsLabel: 'Detailed Explanation',
    requiresLabel: 'Requires',
    backLink: '← Back to all shortcuts',
    footer: 'All rights reserved to Ahmad Alhelo',
    toggleLabel: 'العربية'
  }
};

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

function getInitialLang() {
  const saved = safeStorageGet(LANG_STORAGE_KEY);
  return saved === 'en' || saved === 'ar' ? saved : 'ar';
}

/**
 * Wires the #lang-toggle button and keeps <html lang/dir> + the toggle
 * label in sync. Calls onChange(lang) once immediately and again on
 * every toggle click, so the caller re-renders its own content.
 */
function setupLangToggle(onChange) {
  let currentLang = getInitialLang();

  function apply(lang) {
    currentLang = lang;
    const t = STRINGS[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = t.toggleLabel;
    }
    onChange(lang);
  }

  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      safeStorageSet(LANG_STORAGE_KEY, nextLang);
      apply(nextLang);
    });
  }

  apply(currentLang);

  return {
    getLang: () => currentLang
  };
}
