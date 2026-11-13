
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("campuscare-logged-in");
        sessionStorage.clear();

        window.location.href = "index.html";
    });
}
