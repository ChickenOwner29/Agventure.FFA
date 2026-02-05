// LOGIN
const role = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (role) {
  role.addEventListener("change", () => {
    gradeBox.style.display = role.value === "student" ? "block" : "none";
  });
}

const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const roleVal = role.value;
    const code = document.getElementById("classCode").value;
    const grade = document.getElementById("grade")?.value;

    localStorage.setItem("role", roleVal);
    localStorage.setItem("classCode", code);

    if (!localStorage.getItem(code)) {
      localStorage.setItem(code, JSON.stringify({
        tasks: [],
        students: []
      }));
    }

    if (roleVal === "student") {
      const data = JSON.parse(localStorage.getItem(code));
      data.students.push({
        grade,
        points: 0,
        completed: [],
        photos: {}
      });
      localStorage.setItem(code, JSON.stringify(data));
      window.location.href = "student.html";
    } else {
      window.location.href = "officer.html";
    }
  });
}

// OFFICER DASHBOARD
function addTask() {
  const title = document.getElementById("taskTitle").value;
  const points = parseInt(document.getElementById("taskPoints").value);
  const code = localStorage.getItem("classCode");

  const data = JSON.parse(localStorage.getItem(code));
  data.tasks.push({ title, points });
  localStorage.setItem(code, JSON.stringify(data));
  loadOfficerTasks();
}

function loadOfficerTasks() {
  const code = localStorage.getItem("classCode");
  const data = JSON.parse(localStorage.getItem(code));

  document.getElementById("classCodeDisplay").textContent = code;
  document.getElementById("studentCount").textContent = data.students.length;

  const list = document.getElementById("taskList");
  if (!list) return;
  list.innerHTML = "";

  data.tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;
    list.appendChild(li);
  });

  const photoBox = document.getElementById("photoSubmissions");
  photoBox.innerHTML = "";
  data.students.forEach(s => {
    Object.values(s.photos).forEach(p => {
      const img = document.createElement("img");
      img.src = p;
      photoBox.appendChild(img);
    });
  });
}

// STUDENT TASKS
function loadStudentTasks() {
  const code = localStorage.getItem("classCode");
  const data = JSON.parse(localStorage.getItem(code));
  const student = data.students[data.students.length - 1];

  const list = document.getElementById("studentTasks");
  if (!list) return;

  list.innerHTML = "";
  data.tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;

    if (student.completed.includes(i)) {
      li.classList.add("completed");
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = e => {
        const reader = new FileReader();
        reader.onload = () => {
          student.photos[i] = reader.result;
          student.completed.push(i);
          student.points += t.points;
          localStorage.setItem(code, JSON.stringify(data));
          loadStudentTasks();
        };
        reader.readAsDataURL(e.target.files[0]);
      };
      li.appendChild(input);
    }

    list.appendChild(li);
  });
}

// LEADERBOARD
function loadLeaderboard(grade, id) {
  const list = document.getElementById(id);
  if (!list) return;

  Object.keys(localStorage).forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      data.students
        .filter(s => s.grade === grade)
        .sort((a, b) => b.points - a.points)
        .forEach(s => {
          const li = document.createElement("li");
          li.textContent = `${s.points} points`;
          list.appendChild(li);
        });
    } catch {}
  });
}

// INIT
if (document.getElementById("taskList")) loadOfficerTasks();
if (document.getElementById("studentTasks")) loadStudentTasks();

loadLeaderboard("6", "grade6");
loadLeaderboard("7", "grade7");
loadLeaderboard("8", "grade8");

