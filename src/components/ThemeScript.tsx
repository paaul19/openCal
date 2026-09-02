const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("opencal-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

// Runs synchronously before paint so a stored light/dark preference never
// flashes the wrong theme. Omitted entirely for "system" (no attribute set,
// CSS media query handles it).
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
