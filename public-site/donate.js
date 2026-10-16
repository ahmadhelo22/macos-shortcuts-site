// Donation links. Paste your page link into `url`; entries left empty are hidden.
const DONATE_LINKS = [
  { name: 'Ko-fi', url: 'https://ko-fi.com/ahmadalhelo' },
  { name: 'Buy Me a Coffee', url: '' },    // e.g. https://buymeacoffee.com/yourname
  { name: 'PayPal', url: '' }              // e.g. https://paypal.me/yourname
];

document.addEventListener('DOMContentLoaded', () => {
  setupLangToggle((newLang) => {
    document.title = STRINGS[newLang].donateTitle;
  });
  renderDonateLinks();
});

function renderDonateLinks() {
  const list = document.getElementById('donate-links');
  const links = DONATE_LINKS.filter((link) => link.url);

  document.getElementById('donate-soon').hidden = links.length > 0;
  list.hidden = links.length === 0;

  links.forEach((link) => {
    const a = document.createElement('a');
    a.className = 'download-btn';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.name;
    list.appendChild(a);
  });
}
