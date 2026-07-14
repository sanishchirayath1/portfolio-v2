// Inline script that runs before hydration to set data-theme from
// localStorage. Prevents flash-of-wrong-theme on first paint.
const script = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional — must run before hydration
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}
