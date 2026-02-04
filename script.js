function login() {
    const name = document.getElementById("name").value.trim();
    const code = document.getElementById("signupCode").value.trim();
    const role = document.getElementById("role").value;

    if (!name || !code) {
        alert("Please enter all fields!");
        return;
    }

    // Save user info in local storage
    localStorage.setItem("name", name);
    localStorage.setItem("code", code);
    localStorage.setItem("role", role);

    if (role === "officer") {
        window.location.href = "officer.html";
    } else {
        window.location.href = "student.html";
    }
}
