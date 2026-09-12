# خطة مشروع: موقع عرض شورت كاتس الماك

## ١. الهدف من المشروع

- مشروع تطبيقي برمجي يُحط بالـ CV.
- موقع يعرض شورت كاتس (macOS Shortcuts) من صنع صاحب المشروع، ويسمح لأي زائر بتحميلها.
- **بدون** باك اند، **بدون** قاعدة بيانات، **بدون** نظام مستخدمين للزوار.
- كل شورت كات مبني بحيث يفحص بيئته الخاصة (Homebrew) ويصلّح نفسه تلقائياً لو نقصت أداة مطلوبة، تقليلاً لاحتمال تعطله بعد فترة بسبب تحديثات المكتبات.

---

## ٢. البنية العامة للمشروع (Architecture)

```
/project-root
├── /public-site              ← هذا وبس يلي بينشر على الاستضافة
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── shortcuts.json
│   └── /files
│       └── *.shortcut
│
└── admin.html                 ← يبقى محلي على جهاز صاحب المشروع فقط، لا يُنشر أبداً
```

مبدأ أساسي: الاستضافة (GitHub Pages) تُقرأ **فقط** من مجلد `public-site`. ملف `admin.html` موجود بنفس الريبو لكن خارج هذا المجلد، فلا يظهر أبداً للزوار.

---

## ٣. لغات البرمجة والتقنيات

| الجزء | التقنية |
|---|---|
| الموقع العام (public-site) | HTML, CSS, JavaScript (Vanilla، بدون فريمورك) |
| تخزين البيانات | JSON (`shortcuts.json`) |
| أداة الإدارة (admin.html) | HTML, CSS, JavaScript + GitHub REST API |
| منطق الفحص داخل كل شورت كات | Bash / Zsh (Shell Script Action داخل Shortcuts.app) |
| النشر والتحكم بالنسخ | Git + GitHub Pages |
| التحليلات | Google Analytics 4 (GA4) |

---

## ٤. شكل البيانات — `shortcuts.json`

```json
[
  {
    "name": "Compress Video",
    "description": "ضغط فيديو باستخدام ffmpeg",
    "requires": ["ffmpeg"],
    "file": "files/compress-video.shortcut"
  }
]
```

الحقول الثابتة لكل عنصر: `name`, `description`, `requires` (array), `file` (رابط التحميل).

---

## ٥. الموقع العام (public-site)

- `script.js` يعمل `fetch('shortcuts.json')` ويبني بطاقة لكل شورت كات (اسم، وصف، الأدوات المطلوبة، زر تحميل).
- صفحة استاتيكية بحتة، بدون أي منطق تعديل أو كتابة بيانات.

---

## ٦. الاستضافة — GitHub Pages

- من إعدادات الريبو: `Settings → Pages → Source` → تحديد البرانش (`main`) والمجلد (`public-site`).
- أي commit جديد على الريبو يُحدّث الموقع المنشور تلقائياً (rebuild) خلال ٣٠ ثانية إلى دقيقتين تقريباً.
- شكل الرابط الافتراضي:
  - عام: `https://اسم-المستخدم.github.io/اسم-الريبو/`
  - خاص (لو الريبو باسم الحساب + `.github.io`): `https://اسم-المستخدم.github.io/` — يُستخدم لريبو واحد بس لكل حساب، يُفضّل حجزه لمشروع بورتفوليو أشمل لاحقاً.
- دومين خاص (اختياري، غير ضروري لغرض الـ CV): عبر ملف `CNAME` + تعديل DNS عند مزود الدومين.

---

## ٧. أداة الإدارة (admin.html) — Super User Dashboard

### الفكرة
ملف واحد (HTML+CSS+JS)، يُفتح محلياً من جهاز صاحب المشروع فقط (دبل كليك)، ولا يُرفع للريبو ضمن `public-site` أبداً.

### الآلية (عبر GitHub Contents API)
1. توليد **GitHub Personal Access Token** بصلاحية `repo` فقط (من: `Settings → Developer settings → Personal access tokens`).
2. الفورم يجلب النسخة الحالية من `shortcuts.json` (طلب `GET`).
3. يُعدَّل المحتوى بالجافاسكريبت (إضافة/تعديل عنصر).
4. يُرفع كـ commit جديد مباشرة (طلب `PUT`) — بضغطة زر واحدة، بدون رفع يدوي عبر الاستضافة.

### تحذير أمني
- التوكن يبقى داخل `admin.html` فقط، والملف هذا لا يُنشر أبداً — لذلك لا مشكلة أمنية طالما بقي محلياً.
- **لا يجب أبداً** أن يُرفع `admin.html` عن طريق الخطأ ضمن `public-site` أو أي commit — إذا حصل ذلك، يبقى التوكن في تاريخ Git للأبد حتى بعد حذفه لاحقاً، والحل الوحيد وقتها هو إلغاء التوكن من الأساس من GitHub.

---

## ٨. الفحص الذاتي داخل كل شورت كات (Homebrew Self-Healing)

أول Action في كل ملف `.shortcut`، عبارة عن `Run Shell Script`:

```bash
#!/bin/zsh

BREW="/opt/homebrew/bin/brew"
[ -x "$BREW" ] || BREW="/usr/local/bin/brew"

if [ ! -x "$BREW" ]; then
  echo "Homebrew غير مثبت على هذا الجهاز. الشورت كات بحاجة له."
  exit 1
fi

REQUIRED_PACKAGES=("jq" "ffmpeg")   # تُعدَّل حسب متطلبات كل شورت كات

for pkg in "${REQUIRED_PACKAGES[@]}"; do
  if ! "$BREW" list "$pkg" &>/dev/null; then
    echo "تثبيت $pkg..."
    "$BREW" install "$pkg"
  fi
done
```

ملاحظة تقنية: `Shortcuts.app` لا يحمّل نفس بيئة الـ Terminal، لذلك يجب استخدام المسار الكامل لـ `brew` دائماً وليس الاسم المختصر.

---

## ٩. التحليلات (Analytics) — Google Analytics 4

- تركيب: سطر `<script>` واحد ضمن `<head>` في `index.html`.
- يوفر: عدد الزوار، مصدرهم، سلوكهم العام.
- لتتبع "أكتر شورت كات تحميلاً" تحديداً — يلزم Custom Event عند كل ضغطة تحميل:

```javascript
downloadButton.addEventListener('click', () => {
  gtag('event', 'download_shortcut', {
    'shortcut_name': shortcut.name
  });
});
```

النتائج تظهر لاحقاً في: `GA4 → Reports → Engagement → Events`.

بديل مراعاة للخصوصية (اختياري): Umami (مفتوح المصدر) أو Plausible (مدفوع).

---

## ١٠. خطة التنفيذ (الترتيب الفعلي)

1. تجهيز بنية الريبو (`public-site` منفصل عن `admin.html`).
2. بناء شكل البيانات (`shortcuts.json`) مع ٢-٣ شورت كاتس تجريبية.
3. بناء الموقع العام (`index.html`, `style.css`, `script.js`).
4. ربط الريبو بـ GitHub Pages (تحديد `public-site` كمصدر).
5. توليد GitHub Personal Access Token (صلاحية `repo` فقط).
6. بناء `admin.html` مع تكامل GitHub API (GET + PUT عبر Contents API).
7. بناء نمط الفحص الذاتي (Bash) وإدراجه كأول Action في كل شورت كات جديد.
8. إضافة Google Analytics 4 + Custom Event Tracking لأزرار التحميل.
9. اختبار السير الكامل من طرف لطرف: تعديل عبر `admin.html` → commit تلقائي → تحديث `public-site` بدون تدخل يدوي.
