function generateStudentCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function login() {
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const grade = document.getElementById("grade").value;
    const classCode = document.getElementById("signupCode").value.trim();
    const customCode = document.getElementById("customCode").value.trim();

    let officers = JSON.parse(localStorage.getItem("officers") || "[]");
    let students = JSON.parse(localStorage.getItem("students") || "[]");

    if (role === "officer") {
        const studentCode = customCode || generateStudentCode();

        if (officers.find(o => o.studentCode === studentCode)) {
            alert("That class code already exists.");
            return;
        }

        officers.push({ name, studentCode });
        localStorage.setItem("officers", JSON.stringify(officers));

        localStorage.setItem("role", "officer");
        localStorage.setItem("name", name);
        localStorage.setItem("studentCode", studentCode);

        alert("Your class code is: " + studentCode);
        window.location.href = "officer.html";

    } else {
        if (!grade) {
            alert("Please select your grade.");
            return;
        }

        const valid = officers.find(o => o.studentCode === classCode);
        if (!valid) {
            alert("Invalid class code.");
            return;
        }

        if (!students.find(s => s.name === name && s.officerCode === classCode)) {
            students.push({
                name,
                officerCode: classCode,
                grade,
                points: 0
            });
            localStorage.setItem("students", JSON.stringify(students));
        }

        localStorage.setItem("role", "student");
        localStorage.setItem("name", name);
        localStorage.setItem("officerCode", classCode);

        window.location.href = "student.html";
    }
}
