(function() {
  var themes = {
    'default': { bg: '#0b1110', surface: '#141f1c', card: '#1c2b27', accent: '#d4af37', text: '#f2f5f4', muted: '#94a39f', border: '#263833', font: 'sans-serif' },
    'classic': { bg: '#14110c', surface: '#1f1a12', card: '#261f16', accent: '#e6c253', text: '#f5efe2', muted: '#a89f8d', border: '#4a3f28', font: 'Georgia, serif' },
    'cyber': { bg: '#050a0e', surface: '#0a141c', card: '#0d1b26', accent: '#00e5ff', text: '#e0f7fa', muted: '#4dd0e1', border: '#006064', font: 'monospace' },
    'light': { bg: '#f0f2f5', surface: '#ffffff', card: '#e4e6eb', accent: '#1877f2', text: '#1c1e21', muted: '#65676b', border: '#ced0d4', font: 'sans-serif' },
    'ruby_1000': { bg: '#170509', surface: '#290910', card: '#380d16', accent: '#ff2a55', text: '#fff0f3', muted: '#d98a9b', border: '#75182b', font: 'Georgia, serif' },
    'platinum_10000': { bg: '#09090b', surface: '#141418', card: '#1e1e24', accent: '#e5e4e2', text: '#ffffff', muted: '#a1a1aa', border: '#d4af37', font: 'sans-serif' }
  };

  var cur = JSON.parse(localStorage.getItem('ko_v5_cur'));
  var db = JSON.parse(localStorage.getItem('ko_v5_db')) || { users: [] };
  var me = cur ? (db.users.find(function(u) { return u.id === cur.id; }) || cur) : null;
  var activeKey = (me && me.activeTheme && themes[me.activeTheme]) ? me.activeTheme : 'default';
  var t = themes[activeKey];

  var css = `
    body { background: ${t.bg} !important; color: ${t.text} !important; font-family: ${t.font} !important; }
    .top, .nav { background: ${t.surface} !important; border-color: ${t.border} !important; }
    .card, .item, .proj, .room-item { background: ${t.surface} !important; border-color: ${t.border} !important; color: ${t.text} !important; }
    .law, .book, .msg, .p-row, .log, .info-grid { background: ${t.card} !important; border-color: ${t.accent} !important; color: ${t.text} !important; }
    h1, h2, h3, .top b, .nav a.act { color: ${t.accent} !important; }
    .nav a, p, small { color: ${t.muted} !important; }
    .nav a.act { color: ${t.accent} !important; }
    input, textarea, select, .feed { background: ${t.bg} !important; color: ${t.text} !important; border-color: ${t.border} !important; }
  `;

  if (activeKey === 'platinum_10000') {
    css += `.card, .top { box-shadow: 0 0 18px rgba(229, 228, 226, 0.25) !important; border: 1px solid #e5e4e2 !important; }`;
  }

  var styleTag = document.createElement('style');
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);
})();
