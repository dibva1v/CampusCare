
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    themeToggle.textContent = theme === "dark"
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

const savedTheme = localStorage.getItem("campuscare-theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", function() {
    const newTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    localStorage.setItem("campuscare-theme", newTheme);
    applyTheme(newTheme);
});
