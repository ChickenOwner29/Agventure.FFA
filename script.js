// Generate a 6-character student code
function generateStudentCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Login function
function login() {
    const name = document.getElementById("name").value.trim();
    const codeInput = document.getElementById("signupCode").value.trim();
    const role = document.getElementById("role").value;

    if (!name) { alert("Please enter your name!"); return; }

    // Retrieve saved officers and students
    let officers = JSON.parse(localStorage.getItem("officers") || "[]");
    let students = JSON.parse(localStorage.getItem("students") || "[]");

    if (role === "officer") {
        // Check if officer already exists
        let existing = officers.find(o => o.name === name);
        let studentCode;
        if (existing) {
            studentCode = existing.studentCode; // reuse code
        } else {
            studentCode = generateStudentCode();
            officers.push({ name, studentCode });
            localStorage.setItem("officers", JSON.stringify(officers));
        }

        alert(`Welcome Officer ${name}! Your students can use this code: ${studentCode}`);
        localStorage.setItem("role", "officer");
        localStorage.setItem("name", name);
        localStorage.setItem("studentCode", studentCode);

        window.location.href = "officer.html";
    } else {
        // Student login → validate code
        const validOfficer = officers.find(o => o.studentCode === codeInput);
        if (!validOfficer) { alert("Invalid code! Ask your officer for the correct code."); return; }

        // Check if student already exists
        let existingStudent = students.find(s => s.name === name && s.officerCode === codeInput);
        if (!existingStudent) {
            students.push({ name, officerCode: codeInput, points: 0 });
            localStorage.setItem("students", JSON.stringify(students));
        }

        localStorage.setItem("role", "student");
        localStorage.setItem("name", name);
        localStorage.setItem("officerCode", codeInput);

        window.location.href = "student.html";
    }
}
