/* =====================
   LOGIN PAGE
===================== */
const roleSelect = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    gradeBox.style.display =
      roleSelect.value === "student" ? "block" : "none";
  });
}

const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const code = document.getElementById("classCode").value.trim();
    const grade = document.getElementById("grade")?.value;

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
  const title = document.getElementById("taskTitle").value.trim();
  const points = parseInt(document.getElementById("taskPoints").value);
  const code = localStorage.getItem("currentCode");

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
  const data = JSON.parse(localStorage.getItem(code));

  document.getElementById("classCodeDisplay").textContent = code;
  document.getElementById("studentCount").textContent = data.students.length;

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  data.tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;
    taskList.appendChild(li);
  });

  const photoBox = document.getElementById("photoSubmissions");
  photoBox.innerHTML = "";

  data.students.forEach(s => {
    Object.entries(s.photos).forEach(([taskIndex, photo]) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${s.name}</strong><br>`;
      const img = document.createElement("img");
      img.src = photo;
      div.appendChild(img);
      photoBox.appendChild(div);
    });
  });
}

/* =====================
   STUDENT TASK PAGE
===================== */
function loadStudentTasks() {
  const code = localStorage.getItem("currentCode");
  const name = localStorage.getItem("currentUser");
  const data = JSON.parse(localStorage.getItem(code));
  const student = data.students.find(s => s.name === name);

  const list = document.getElementById("studentTasks");
  if (!list || !student) return;

  list.innerHTML = "";

  data.tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = `${task.title} (${task.points} pts)`;

    if (student.completed.includes(index)) {
      li.classList.add("completed");
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = e => {
        const reader = new FileReader();
        reader.onload = () => {
          student.photos[index] = reader.result;
          student.completed.push(index);
          student.points += task.points;

          localStorage.setItem(code, JSON.stringify(data));
          loadStudentTasks();
        };
        reader.readAsDataURL(e.target.files[0]);
      };

      li.appendChild(document.createElement("br"));
      li.appendChild(input);
    }

    list.appendChild(li);
  });
}

/* =====================
   LEADERBOARD
===================== */
function loadLeaderboard(grade, elementId) {
  const list = document.getElementById(elementId);
  if (!list) return;

  list.innerHTML = "";

  Object.keys(localStorage).forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      data.students
        .filter(s => s.grade === grade)
        .sort((a, b) => b.points - a.points)
        .forEach(s => {
          const li = document.createElement("li");
          li.textContent = `${s.name} — ${s.points} pts`;
          list.appendChild(li);
        });
    } catch {}
  });
}

/* =====================
   AUTO LOAD
===================== */
if (document.getElementById("taskList")) loadOfficerDashboard();
if (document.getElementById("studentTasks")) loadStudentTasks();

loadLeaderboard("6", "grade6");
loadLeaderboard("7", "grade7");
loadLeaderboard("8", "grade8");
