document.addEventListener("DOMContentLoaded", function() {

  // LOGIN PAGE
  var loginForm = document.getElementById("loginForm");
  var roleSelect = document.getElementById("role");
  var gradeBox = document.getElementById("gradeBox");

  if (roleSelect) {
    roleSelect.addEventListener("change", function() {
      gradeBox.style.display = roleSelect.value === "student" ? "block" : "none";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();

      var nameInput = document.getElementById("name");
      var roleInput = document.getElementById("role");
      var codeInput = document.getElementById("classCode");
      var gradeInput = document.getElementById("grade");

      var name = nameInput.value.trim();
      var role = roleInput.value;
      var code = codeInput.value.trim();
      var grade = gradeInput ? gradeInput.value : null;

      if (!name || !role || !code) {
        alert("Please fill out all required fields.");
        return;
      }

      localStorage.setItem("currentUser", name);
      localStorage.setItem("currentRole", role);
      localStorage.setItem("currentCode", code);

      if (!localStorage.getItem(code)) {
        localStorage.setItem(code, JSON.stringify({ tasks: [], students: [] }));
      }

      var data = JSON.parse(localStorage.getItem(code));

      if (role === "student") {
        if (!grade) {
          alert("Please select your grade.");
          return;
        }
        if (!data.students.find(function(s){ return s.name === name; })) {
          data.students.push({ name: name, grade: grade, points: 0, completed: [], photos: {} });
        }
        localStorage.setItem(code, JSON.stringify(data));
        window.location.href = "student.html";
      } else {
        window.location.href = "officer.html";
      }
    });
  }

  // OFFICER FUNCTIONS
  window.addTask = function() {
    var code = localStorage.getItem("currentCode");
    if (!code) return;

    var titleInput = document.getElementById("taskTitle");
    var pointsInput = document.getElementById("taskPoints");

    var title = titleInput.value.trim();
    var points = Number(pointsInput.value);

    if (!title || isNaN(points) || points <= 0) {
      alert("Enter valid task name and points.");
      return;
    }

    var data = JSON.parse(localStorage.getItem(code));
    data.tasks.push({ title: title, points: points });
    localStorage.setItem(code, JSON.stringify(data));

    titleInput.value = "";
    pointsInput.value = "";

    loadOfficer();
  };

  function loadOfficer() {
    var code = localStorage.getItem("currentCode");
    if (!code) return;

    var data = JSON.parse(localStorage.getItem(code));

    // Tasks
    var taskList = document.getElementById("taskList");
    if (taskList) {
      taskList.innerHTML = "";
      data.tasks.forEach(function(t) {
        var li = document.createElement("li");
        li.textContent = t.title + " (" + t.points + " pts)";
        taskList.appendChild(li);
      });
    }

    // Photos
    var photoBox = document.getElementById("photoSubmissions");
    if (photoBox) {
      photoBox.innerHTML = "";
      data.students.forEach(function(s) {
        Object.keys(s.photos).forEach(function(i) {
          var div = document.createElement("div");
          div.className = "photoCard";
          var taskTitle = data.tasks[i] ? data.tasks[i].title : "";
          div.innerHTML = "<strong>" + s.name + "</strong><br>" + taskTitle + "<br>";
          var img = document.createElement("img");
          img.src = s.photos[i];
          img.style.maxWidth = "200px";
          div.appendChild(img);
          photoBox.appendChild(div);
        });
      });
    }

    var codeDisplay = document.getElementById("classCodeDisplay");
    if (codeDisplay) codeDisplay.textContent = code;

    loadLeaderboard();
  }

  // STUDENT PAGE
  function loadStudent() {
    var code = localStorage.getItem("currentCode");
    var name = localStorage.getItem("currentUser");
    if (!code || !name) return;

    var data = JSON.parse(localStorage.getItem(code));
    var student = data.students.find(function(s){ return s.name === name; });
    if (!student) return;

    var studentNameEl = document.getElementById("studentName");
    if (studentNameEl) studentNameEl.textContent = name;

    var list = document.getElementById("studentTasks");
    if (list) {
      list.innerHTML = "";
      data.tasks.forEach(function(t, i) {
        var li = document.createElement("li");
        li.textContent = t.title + " (" + t.points + " pts)";

        if (student.completed.includes(i)) {
          li.classList.add("completed");
        } else {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.addEventListener("change", function(e) {
            var reader = new FileReader();
            reader.onload = function() {
              student.photos[i] = reader.result;
              student.completed.push(i);
              student.points += t.points;
              localStorage.setItem(code, JSON.stringify(data));
              loadStudent();
              loadLeaderboard();
            };
            reader.readAsDataURL(e.target.files[0]);
          });
          li.appendChild(input);
        }

        list.appendChild(li);
      });
    }

    loadLeaderboard();
  }

  // LEADERBOARD
  function loadLeaderboard() {
    var code = localStorage.getItem("currentCode");
    if (!code) return;

    var data = JSON.parse(localStorage.getItem(code));
    ["6", "7", "8"].forEach(function(grade){
      var list = document.getElementById("grade"+grade);
      if (!list) return;
      list.innerHTML = "";
      data.students
        .filter(function(s){ return s.grade === grade; })
        .sort(function(a,b){ return b.points - a.points; })
        .forEach(function(s){
          var li = document.createElement("li");
          li.textContent = s.name + " — " + s.points + " pts";
          list.appendChild(li);
        });
    });
  }

  // AUTO LOAD
  if (document.getElementById("taskList")) loadOfficer();
  if (document.getElementById("studentTasks")) loadStudent();
  if (document.getElementById("grade6")) loadLeaderboard();

});
