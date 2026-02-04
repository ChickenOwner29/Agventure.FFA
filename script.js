// Generate random 6-character code (fallback)
function generateStudentCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Login function
function login() {
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    let codeInput = document.getElementById("signupCode").value.trim();
    const customCode = document.getElementById("customCode").value.trim();

    let officers = JSON.parse(localStorage.getItem("officers") || "[]");
    let students = JSON.parse(localStorage.getItem("students") || "[]");

    if(role === "officer") {
        let studentCode = customCode || generateStudentCode();

        // Prevent duplicate officer codes
        if(officers.find(o => o.studentCode === studentCode)) {
            alert("This code is already taken! Pick another code.");
            return;
        }

        officers.push({ name, studentCode });
        localStorage.setItem("officers", JSON.stringify(officers));

        alert(`Welcome Officer ${name}! Your students can use this code: ${studentCode}`);
        localStorage.setItem("role","officer");
        localStorage.setItem("name", name);
        localStorage.setItem("studentCode", studentCode);

        window.location.href = "officer.html";

    } else {
        // Check for officer code from URL or input
        const urlParams = new URLSearchParams(window.location.search);
        const officerCodeFromQR = urlParams.get('officer');
        const officerCode = officerCodeFromQR || codeInput;

        if(!officerCode) {
            alert("Please enter the class code from your officer or scan the QR.");
            return;
        }

        const validOfficer = officers.find(o => o.studentCode === officerCode);
        if(!validOfficer) {
            alert("Invalid class code! Ask your officer.");
            return;
        }

        // Add student if not already saved
        if(!students.find(s => s.name === name && s.officerCode === officerCode)) {
            students.push({ name, officerCode, points: 0 });
            localStorage.setItem("students", JSON.stringify(students));
        }

        localStorage.setItem("role", "student");
        localStorage.setItem("name", name);
        localStorage.setItem("officerCode", officerCode);

        window.location.href = "student.html";
    }
}
