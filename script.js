/* =====================
   LOGIN
===================== */
const loginForm = document.getElementById("loginForm");
const roleSelect = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    gradeBox.style.display = roleSelect.value === "student" ? "block" : "none";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const code = document.getElementById("classCode").value.trim();
    const grade = document.getElementById("grade")?.value;

    if (!name || !role || !code) {
      alert("Fill out all fields.");
      return;
    }

    // 🔒 HARD RESET SESSION
    localStorage.removeItem("currentCode");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");

    localStorage.setItem("currentUser", name);
    localStorage.setItem("currentRole", role);
    localStorage.setItem("currentCode", code);

    if (!localStorage.getItem(code)) {
      localStorage.setItem(code, JSON.stringify({
        tasks: [],
        students: []
      }));
    }

    if (role === "student") {
      const data = JSON.parse(localStorage.getItem(code));

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
function addTask() {
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
}

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

  document.getElementById("
