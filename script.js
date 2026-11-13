
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    message.textContent = "Signing in...";

    setTimeout(function() {
        if (username === "staff" && password === "1234") {
            message.textContent = "Login successful! Redirecting...";

            // Save login status
            localStorage.setItem("campuscare-logged-in", "true");

            setTimeout(function() {
                window.location.href = "dashboard.html";
            }, 700);

        } else {
            message.textContent = "Incorrect username or password.";
        }
    }, 700);
});
