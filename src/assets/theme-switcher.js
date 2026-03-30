document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggles();
});

function applyTheme(isDark) {
  document.documentElement.classList.add("disable-transitions");

  // Force reflow so transition suppression is active before the theme class flips.
  void document.documentElement.offsetWidth;

  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("disable-transitions");
    });
  });
}

// Setup all theme toggle buttons
function setupThemeToggles() {
  // Function to toggle the theme
  function toggleTheme() {
    applyTheme(!document.documentElement.classList.contains("dark"));
  }

  // Desktop toggle button
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Mobile toggle button
  const themeToggleMobile = document.getElementById(
    "theme-toggle-mobile",
  );
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", toggleTheme);
  }
}

// Listen for system preference changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    const newColorScheme = e.matches ? "dark" : "light";
    if (!localStorage.getItem("theme")) {
      // Only change if user hasn't explicitly set a preference
      applyTheme(newColorScheme === "dark");
    }
  });
