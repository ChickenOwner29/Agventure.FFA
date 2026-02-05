/* =====================
   LOGIN PAGE LOGIC
===================== */
const roleSelect = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (roleSelect) {
  roleSelect.addEventListener("change", () => {
    gradeBox.style.display =
      roleSelect.value === "student" ? "block" : "none";
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value;
    const code = document.getElementById("classCode").value.trim();
    const grade = document.getElementById("grade")?.value;

    if (!name || !role || !code) {
      alert("Please fill out all fields.");
      return;
    }

    localStorage.setItem("currentUser", name);
    localStorage.setItem("currentRole", role);
    localStorage.setItem("currentCode", code);

    // Create class if it doesn't exist
    if (!localStorage.getItem(code)) {
      localStorage.setItem(code, JSON.stringify({
        tasks: [],
        students: []
      }));
    }

    if (role === "student") {
      const data = JSON.parse(localStorage.getItem(code));

      // Prevent duplicate student names
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
  const titleInput = document.getElementById("taskTitle");
  const pointsInput = document.getElementById("taskPoints");

  if (!titleInput || !pointsInput) return;

  const title = titleInput.value.trim();
  const points = parseInt(pointsInput.value);
  const code = localStorage.getItem("currentCode");

  if (!title || isNaN(points)) {
    alert("Enter a task name and points.");
    return;
  }

  const data = JSON.parse(localStorage.getItem(code));
  data.tasks.push({ title, points });
  localStorage.setItem(code, JSON.stringify(data));

  titleInput.value = "";
  pointsInput.value = "";

  loadOfficerDashboard();
}

function loadOfficerDashboard() {
  const code = localStorage.getItem("currentCode");
  if (!code) return;

  const data = JSON.parse(localStorage.getItem(code));
  if (!data) return;

  const codeDisplay = document.getElementById("classCodeDisplay");
  const studentCount = document.getElementById("studentCount");
  const taskList = document.getElementById("taskList");
  const photoBox = document.getElementById("photoSubmissions");

  if (codeDisplay) codeDisplay.textContent = code;
  if (studentCount) studentCount.textContent = data.students.length;

  if (taskList) {
    taskList.innerHTML = "";
    data.tasks.forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${t.title} (${t.points} pts)`;
      taskList.appendChild(li);
    });
  }

  if (photoBox) {
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
}

/* =====================
   STUDENT TASK PAGE
===================== */
function loadStudentTasks() {
  const code = localStorage.getItem("currentCode");
  const name = localStorage.getItem("currentUser");

  if (!code || !name) return;

  const data = JSON.parse(localStorage.getItem(code));
  if (!data || !data.tasks) return;

  const student = data.students.find(s => s.name === name);
  if (!student) return;

  const nameDisplay = document.getElementById("studentName");
  if (nameDisplay) nameDisplay.textContent = name;

  const list = document.getElementById("studentTasks");
  if (!list) return;

  list.innerHTML = "";

  if (data.tasks.length === 0) {
    list.innerHTML = "<li>No tasks yet. Check back soon!</li>";
    return;
  }

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
   LEADERBOARD
===================== */
function loadLeaderboard(grade, elementId) {
  const list = document.getElementById(elementId);
  if (!list) return;

  list.innerHTML = "";

  Object.keys(localStorage).forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data.students) return;

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
   AUTO LOAD BY PAGE
===================== */
if (document.getElementById("taskList")) loadOfficerDashboard();
if (document.getElementById("studentTasks")) loadStudentTasks();

loadLeaderboard("6", "grade6");
loadLeaderboard("7", "grade7");
loadLeaderboard("8", "grade8");
