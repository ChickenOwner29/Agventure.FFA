document.addEventListener("DOMContentLoaded", () => {

/* =====================
   LOGIN
===================== */
const loginForm = document.getElementById("loginForm");
const roleSelect = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    if (gradeBox) {
      gradeBox.style.display = roleSelect.value === "student" ? "block" : "none";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const code = document.getElementById("classCode").value.trim();
    const grade = document.getElementById("grade")?.value || null;

    if (!name || !role || !code) {
      alert("Please fill out all fields.");
      return;
    }

    // Store current session
    localStorage.setItem("currentUser", name);
    localStorage.setItem("currentRole", role);
    localStorage.setItem("currentCode", code);

    // Initialize class if needed
    if (!localStorage.getItem(code)) {
      localStorage.setItem(code, JSON.stringify({
        tasks: [],
        students: []
      }));
    }

    const data = JSON.parse(localStorage.getItem(code));

    if (role === "student") {
      if (!grade) {
        alert("Please select a grade.");
        return;
      }

      if (!data.students.find(s => s.name === name)) {
        data.students.push({
          name,
          grade,
          points: 0,
          completed: [],
          photos: {}
        });
      }

      localStorage.setItem(code, JSON.stringify(data));
      window.location.href = "student.html";
    } else {
      window.location.href = "officer.html";
    }
  });
}

/* =====================
   OFFICER DASHBOARD
===================== */
window.addTask = function () {
  const code = localStorage.getItem("currentCode");
  if (!code) return;

  const title = document.getElementById("taskTitle").value.trim();
  const points = parseInt(document.getElementById("taskPoints").value);

  if (!title || isNaN(points)) {
    alert("Enter task name and points.");
    return;
  }

  const data = JSON.parse(localStorage.getItem(code));
  data.tasks.push({ title, points });
  localStorage.setItem(code, JSON.stringify(data));

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskPoints").value = "";

  loadOfficerDashboard();
};

function loadOfficerDashboard() {
  const code = localStorage.getItem("currentCode");
  if (!code) return;

  const data = JSON.parse(localStorage.getItem(code));
  document.getElementById("classCodeDisplay").textContent = code;

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  data.tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;
    taskList.appendChild(li);
  });

  const photoBox = document.getElementById("photoSubmissions");
  photoBox.innerHTML = "";

  data.students.forEach(student => {
    Object.entries(student.photos).forEach(([taskIndex, photo]) => {
      const div = document.createElement("div");
      div.className = "photoCard";

      div.innerHTML = `
        <strong>${student.name}</strong><br>
        <em>${data.tasks[taskIndex]?.title || "Task"}</em><br>
      `;

      const img = document.createElement("img");
      img.src = photo;
      img.style.maxWidth = "200px";

      div.appendChild(img);
      photoBox.appendChild(div);
    });
  });
}

/* =====================
   STUDENT TASKS
===================== */
function loadStudentTasks() {
  const code = localStorage.getItem("currentCode");
  const name = localStorage.getItem("currentUser");
  if (!code || !name) return;

  const data = JSON.parse(localStorage.getItem(code));
  const student = data.students.find(s => s.name === name);
  if (!student) return;

  document.getElementById("studentName").textContent = name;

  const list = document.getElementById("studentTasks");
  list.innerHTML = "";

  data.tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${task.title}</strong> (${task.points} pts)`;

    if (student.completed.includes(index)) {
      li.classList.add("completed");
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          student.photos[index] = reader.result;
          student.completed.push(index);
          student.points += task.points;

          localStorage.setItem(code, JSON.stringify(data));
          loadStudentTasks();
          loadLeaderboard();
        };
        reader.readAsDataURL(file);
      };

      li.appendChild(document.createElement("br"));
      li.appendChild(input);
    }

    list.appendChild(li);
  });
}

/* =====================
   LEADERBOARD (PER CODE)
===================== */
function loadLeaderboard() {
  const code = localStorage.getItem("currentCode");
  if (!code) return;

  const data = JSON.parse(localStorage.getItem(code));
  if (!data || !data.students) return;

  ["6", "7", "8"].forEach(grade => {
    const list = document.getElementById(`grade${grade}`);
    if (!list) return;

    list.innerHTML = "";

    data.students
      .filter(s => s.grade === grade)
      .sort((a, b) => b.points - a.points)
      .forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} — ${s.points} pts`;
        list.appendChild(li);
      });
  });
}

/* =====================
   AUTO LOAD
===================== */
if (document.getElementById("taskList")) loadOfficerDashboard();
if (document.getElementById("studentTasks")) loadStudentTasks();
if (document.getElementById("grade6")) loadLeaderboard();

});
