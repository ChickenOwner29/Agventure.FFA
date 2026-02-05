document.addEventListener("DOMContentLoaded", () => {

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

      // ✅ FIX: explicitly grab inputs
      const nameInput = document.getElementById("name");
      const roleInput = document.getElementById("role");
      const codeInput = document.getElementById("classCode");
      const gradeInput = document.getElementById("grade");

      const name = nameInput.value.trim();
      const role = roleInput.value;
      const code = codeInput.value.trim();
      const grade = gradeInput ? gradeInput.value : null;

      if (!name || !role || !code) {
        alert("Please fill out all required fields.");
        return;
      }

      // Save session
      localStorage.setItem("currentUser", name);
      localStorage.setItem("currentRole", role);
      localStorage.setItem("currentCode", code);

      // Initialize class data if needed
      if (!localStorage.getItem(code)) {
        localStorage.setItem(code, JSON.stringify({
          tasks: [],
          students: []
        }));
      }

      const data = JSON.parse(localStorage.getItem(code));

      if (role === "student") {
        if (!grade) {
          alert("Please select your grade.");
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
    const points = Number(document.getElementById("taskPoints").value);

    if (!title || isNaN(points) || points <= 0) {
      alert("Enter valid task name and points.");
      return;
    }

    const data = JSON.parse(localStorage.getItem(code));
    data.tasks.push({ title, points });
    localStorage.setItem(code, JSON.stringify(data));

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskPoints").value = "";

    loadOfficer();
  };

  function loadOfficer() {
    const code = localStorage.getItem("currentCode");
    if (!code) return;

    const data = JSON.parse(localStorage.getItem(code));
    const taskList = document.getElementById("taskList");
    if (taskList) {
      taskList.innerHTML = "";
      data.tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.textContent = `${t.title} (${t.points} pts)`;
        taskList.appendChild(li);
      });
    }

    const photoBox = document.getElementById("photoSubmissions");
    if (photoBox) {
      photoBox.innerHTML = "";
      data.students.forEach(s => {
        Object.entries(s.photos).forEach(([i, photo]) => {
          const div = document.createElement("div");
          div.className = "photoCard";
          div.innerHTML = `<strong>${s.name}</strong><br>${data.tasks[i]?.title}<br>`;
          const img = document.createElement("img");
          img.src = photo;
          img.style.maxWidth = "200px";
          div.appendChild(img);
          photoBox.appendChild(div);
        });
      });
    }

    const codeDisplay = document.getElementById("classCodeDisplay");
    if (codeDisplay) codeDisplay.textContent = code;
  }

  /* =====================
     STUDENT TASKS
  ===================== */
  function loadStudent() {
    const code = localStorage.getItem("currentCode");
    const name = localStorage.getItem("currentUser");
    if (!code || !name) return;

    const data = JSON.parse(localStorage.getItem(code));
    const student = data.students.find(s => s.name === name);
    if (!student) return;

    const studentNameEl = document.getElementById("studentName");
    if (studentNameEl) studentNameEl.textContent = name;

    const list = document.getElementById("studentTasks");
    if (list) {
      list.innerHTML = "";
      data.tasks.forEach((t, i) => {
        const li = document.createElement("li");
        li.textContent = `${t.title} (${t.points} pts)`;

        if (student.completed.includes(i)) {
          li.classList.add("completed");
        } else {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = e => {
            const reader = new FileReader();
            reader.onload = () => {
              student.photos[i] = reader.result;
              student.completed.push(i);
              student.points += t.points;
              localStorage.setItem(code, JSON.stringify(data));
              loadStudent();
            };
            reader.readAsDataURL(e.target.files[0]);
          };
          li.appendChild(input);
        }

        list.appendChild(li);
      });
    }
  }

  /* =====================
     LEADERBOARD
  ===================== */
  function loadLeaderboard() {
    const code = localStorage.getItem("currentCode");
    if (!code) return;

    const data = JSON.parse(localStorage.getItem(code));
    ["6","7","8"].forEach(grade => {
      const list = document.getElementById("grade"+grade);
      if (!list) return;
      list.innerHTML = "";
      data.students
        .filter(s => s.grade === grade)
        .sort((a,b) => b.points - a.points)
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
  if (document.getElementById("taskList")) loadOfficer();
  if (document.getElementById("studentTasks")) loadStudent();
  if (document.getElementById("grade6")) loadLeaderboard();

});
