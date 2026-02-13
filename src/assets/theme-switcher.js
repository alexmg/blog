document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggles();
});

// Setup all theme toggle buttons
function setupThemeToggles() {
  // Function to toggle the theme
  function toggleTheme() {
    // Disable Astro transitions during theme switch
    document.documentElement.classList.add("disable-transitions");

    // Force reflow to ensure the class is applied before toggling theme
    void document.documentElement.offsetWidth;

    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Remove the class after the next frame
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("disable-transitions");
    });
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
      if (newColorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  });
