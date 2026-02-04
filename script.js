// Generate random 6-character student code
function generateStudentCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function login() {
    const name = document.getElementById("name").value.trim();
    const codeInput = document.getElementById("signupCode").value.trim();
    const role = document.getElementById("role").value;

    if (!name) {
        alert("Please enter your name!");
        return;
    }

    if (role === "officer") {
        // Officer login → generate a student code
        const studentCode = generateStudentCode();
        alert(`Welcome ${name}! Your students can use this code to log in: ${studentCode}`);

        let officers = JSON.parse(localStorage.getItem("officers") || "[]");
        officers.push({ name, studentCode });
        localStorage.setItem("officers", JSON.stringify(officers));

        localStorage.setItem("role", "officer");
        localStorage.setItem("name", name);
        localStorage.setItem("studentCode", studentCode);

        window.location.href = "officer.html";
    } else {
        // Student login → validate code
        let officers = JSON.parse(localStorage.getItem("officers") || "[]");
        const validOfficer = officers.find(o => o.studentCode === codeInput);

        if (!validOfficer) {
            alert("Invalid code! Ask your officer for the correct code.");
            return;
        }

        localStorage.setItem("role", "student");
        localStorage.setItem("name", name);
        localStorage.setItem("officerCode", codeInput);

        window.location.href = "student.html";
    }
}
