// script.js
// Handles theme switching and global utilities.
// All portfolio data logic (CRUD, preview, save) lives in index.html's inline script.

document.addEventListener('DOMContentLoaded', () => {

  /* ===== THEME SWITCHER =====
     Syncs .theme-card clicks with body[data-theme] attribute.
     The actual portfolio template selection (hacker, editorial, etc.)
     is handled inside index.html's inline <script> via selectTemplate().
  */
  const savedTheme = localStorage.getItem('hbTheme') || 'default';
  applyTheme(savedTheme);

  document.querySelectorAll('.theme-card').forEach(card => {
    const theme = card.dataset.theme;

    // Mark the active card on load
    if (theme === savedTheme) card.classList.add('selected');

    card.addEventListener('click', () => {
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      applyTheme(theme);
      localStorage.setItem('hbTheme', theme);
    });
  });

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme === 'default' ? '' : theme);
  }

  /* ===== KEYBOARD SHORTCUTS ===== */
  document.addEventListener('keydown', e => {
    // Ctrl/Cmd + S → trigger save feedback toast (data already autosaves via debounce)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (typeof showToast === 'function') showToast('Auto-saved ✓');
    }
  });

});