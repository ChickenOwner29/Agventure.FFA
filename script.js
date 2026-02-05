document.addEventListener("DOMContentLoaded", () => {

/* ===== LOGIN ===== */
const loginForm = document.getElementById("loginForm");
const role = document.getElementById("role");
const gradeBox = document.getElementById("gradeBox");

if (role) {
  role.onchange = () => {
    gradeBox.style.display = role.value === "student" ? "block" : "none";
  };
}

if (loginForm) {
  loginForm.onsubmit = e => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const roleVal = role.value;
    const code = classCode.value.trim();
    const grade = document.getElementById("grade")?.value;

    if (!name || !roleVal || !code) return alert("Missing info");

    localStorage.setItem("currentUser", name);
    localStorage.setItem("currentRole", roleVal);
    localStorage.setItem("currentCode", code);

    if (!localStorage.getItem(code)) {
      localStorage.setItem(code, JSON.stringify({ tasks: [], students: [] }));
    }

    const data = JSON.parse(localStorage.getItem(code));

    if (roleVal === "student") {
      if (!grade) return alert("Select grade");

      if (!data.students.find(s => s.name === name)) {
        data.students.push({ name, grade, points: 0, completed: [], photos: {} });
      }

      localStorage.setItem(code, JSON.stringify(data));
      window.location.href = "student.html";
    } else {
      window.location.href = "officer.html";
    }
  };
}

/* ===== OFFICER ===== */
window.addTask = function () {
  const code = localStorage.getItem("currentCode");
  const data = JSON.parse(localStorage.getItem(code));

  data.tasks.push({
    title: taskTitle.value,
    points: Number(taskPoints.value)
  });

  localStorage.setItem(code, JSON.stringify(data));
  loadOfficer();
};

function loadOfficer() {
  const code = localStorage.getItem("currentCode");
  const data = JSON.parse(localStorage.getItem(code));

  classCodeDisplay.textContent = code;
  taskList.innerHTML = "";

  data.tasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;
    taskList.appendChild(li);
  });

  photoSubmissions.innerHTML = "";
  data.students.forEach(s => {
    for (let i in s.photos) {
      const div = document.createElement("div");
      div.className = "photoCard";
      div.innerHTML = `<strong>${s.name}</strong><br>${data.tasks[i].title}<br>`;
      const img = document.createElement("img");
      img.src = s.photos[i];
      img.style.maxWidth = "200px";
      div.appendChild(img);
      photoSubmissions.appendChild(div);
    }
  });
}

/* ===== STUDENT ===== */
function loadStudent() {
  const code = localStorage.getItem("currentCode");
  const name = localStorage.getItem("currentUser");
  const data = JSON.parse(localStorage.getItem(code));
  const student = data.students.find(s => s.name === name);

  studentName.textContent = name;
  studentTasks.innerHTML = "";

  data.tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (${t.points} pts)`;

    if (student.completed.includes(i)) {
      li.classList.add("completed");
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = e => {
        const r = new FileReader();
        r.onload = () => {
          student.photos[i] = r.result;
          student.completed.push(i);
          student.points += t.points;
          localStorage.setItem(code, JSON.stringify(data));
          loadStudent();
        };
        r.readAsDataURL(e.target.files[0]);
      };
      li.appendChild(input);
    }

    studentTasks.appendChild(li);
  });
}

/* ===== LEADERBOARD ===== */
function loadLeaderboard() {
  const code = localStorage.getItem("currentCode");
  const data = JSON.parse(localStorage.getItem(code));

  ["6","7","8"].forEach(g => {
    const list = document.getElementById("grade"+g);
    if (!list) return;
    list.innerHTML = "";
    data.students.filter(s=>s.grade===g)
      .sort((a,b)=>b.points-a.points)
      .forEach(s=>{
        const li=document.createElement("li");
        li.textContent=`${s.name} — ${s.points} pts`;
        list.appendChild(li);
      });
  });
}

/* ===== AUTO LOAD ===== */
if (document.getElementById("taskList")) loadOfficer();
if (document.getElementById("studentTasks")) loadStudent();
if (document.getElementById("grade6")) loadLeaderboard();

});
