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
    toggleLabel: 'English',
    setupTitle: 'قبل ما تبلش: فعّل',
    setupIntro: 'الشورت كات بتشتغل بخطوة Run Shell Script، وتطبيق Shortcuts بيمنع السكريبتات افتراضياً. بدون هالخيار ما رح تشتغل أبداً. بتعملها مرة وحدة بس.',
    setupSteps: [
      'افتح تطبيق Shortcuts واضغط على قائمة Shortcuts فوق على الشمال.',
      'اختار Settings… (أو اضغط ⌘,).',
      'روح على تبويب Advanced.',
      'علّم صح على'
    ],
    setupImageAlt: [
      'قائمة Shortcuts وفيها خيار Settings',
      'تبويب Advanced وفيه خيار Allow Running Scripts'
    ],
    hotkeyTitle: 'اختصار الكيبورد',
    hotkeyAuto: 'ما في شي لازم تعمله: أول مرة بتشغّل فيها الشورت كات (من زر المشاركة أو من تطبيق Shortcuts) بيتسجّل الاختصار لحاله، وبيوصلك إشعار فيه.',
    hotkeyCheck: 'للتأكد منه أو لتغييره: افتح الشورت كات بتطبيق Shortcuts واضغط زر ⓘ فوق، وبتلاقيه بسطر Run with. إذا السطر مش موجود، اضغط Add Keyboard Shortcut واكبس المفاتيح.',
    hotkeyName: 'مهم: خلّي اسم الشورت كات متل ما هو لحد ما تشغّلها أول مرة، لأنو التسجيل التلقائي بيدوّر عليها بالاسم.',
    hotkeyImageAlt: 'لوحة Details بتطبيق Shortcuts وفيها سطر Run with',
    exampleTitle: 'مثال عملي',
    keyNames: { '⌃': 'Control', '⌥': 'Option', '⌘': 'Command', '⇧': 'Shift' }
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
    toggleLabel: 'العربية',
    setupTitle: 'Before you start: turn on',
    setupIntro: 'These shortcuts use a Run Shell Script step, and the Shortcuts app blocks scripts by default. Without this setting they won’t run at all. You only need to do it once.',
    setupSteps: [
      'Open the Shortcuts app and click the Shortcuts menu at the top left.',
      'Choose Settings… (or press ⌘,).',
      'Go to the Advanced tab.',
      'Tick'
    ],
    setupImageAlt: [
      'The Shortcuts menu with the Settings item',
      'The Advanced tab with the Allow Running Scripts option'
    ],
    hotkeyTitle: 'Keyboard shortcut',
    hotkeyAuto: 'Nothing to set up: the first time you run the shortcut (from the Share button or the Shortcuts app) the keyboard shortcut is assigned automatically, and a notification tells you.',
    hotkeyCheck: 'To check or change it: open the shortcut in the Shortcuts app and click the ⓘ button at the top; it’s on the Run with line. If that line isn’t there, click Add Keyboard Shortcut and press the keys.',
    hotkeyName: 'Important: keep the shortcut’s name as it is until its first run, because the automatic setup looks it up by name.',
    hotkeyImageAlt: 'The Details panel in the Shortcuts app with the Run with line',
    exampleTitle: 'Example',
    keyNames: { '⌃': 'Control', '⌥': 'Option', '⌘': 'Command', '⇧': 'Shift' }
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
