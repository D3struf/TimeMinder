document.addEventListener("DOMContentLoaded", function() {
  fetch("pages/header.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
  });
});

const tasks = ["Create a presentation", "Complete a project", "Write a blog post", "Buy groceries", "Start your day with a few minutes of mindfulness or meditation to center yourself", "Start your day with a few minutes of mindfulness or meditation to center yourself"];
let finishedTask = 0;
const daysArray = [];

document.addEventListener("DOMContentLoaded", function() {
  fetch("components/progress.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("progress-placeholder").innerHTML = data;

      // Get current time and date
      const currentTime = new Date().getHours();
      let time;

      if (currentTime < 12) {
        time = "Good morning, Alvin! Rise and shine, ready to tackle the day ahead with enthusiasm and positivity?";
      } else if (currentTime < 18) {
        time = "Good afternoon, Alvin! You're doing well, Keep it up!";
      } else {
        time = "Good evening, Alvin! You did a great job today. Rest well to have another great day.";
      }

      document.getElementById('current-time').innerText = time;

      const rates = document.getElementById('rated');
      const average = document.getElementById('average');
      const taskCount = tasks.length;
      rates.innerText = `${finishedTask}/${taskCount}`;
      average.innerText = `${(finishedTask/taskCount)*100}`;

      function updateRates() {
        rates.innerText = `${finishedTask}/${taskCount}`;
        average.innerText = `${((finishedTask/taskCount)*100).toFixed(0)}`;
      }

      // Store updateRates function globally
      window.updateRates = updateRates;
  });
});

document.addEventListener("DOMContentLoaded", function() {
  fetch("components/task.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("tasks-placeholder").innerHTML = data;

      const taskList = document.getElementById("task-list");
      tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        listItem.classList = "flex flex-row gap-3 items-start py-3 border-b-2 border-gray-200";

        const input = document.createElement("div");
        input.id = `task${index}`;
        input.classList = "bg-white border-2 border-gray-400 rounded-md w-6 mt-1.5"
        input.onclick = () => lineThrough(`task${index}`, 0);

        const checkbox = document.createElement("img");
        checkbox.src = "../../src/assets/check.svg";
        checkbox.classList = "cursor-pointer";

        const taskText = document.createElement("p");
        taskText.innerText = task;
        taskText.classList = "text-wrap w-full pr-8 self-center";

        input.appendChild(checkbox);
        listItem.appendChild(input);
        listItem.appendChild(taskText);
        taskList.appendChild(listItem);
      });
  });
});

function lineThrough(index, task) {
  const checkbox = document.getElementById(index);
  const text = checkbox.parentElement.querySelector("p");


  if (checkbox.classList.contains("bg-white")) {
    checkbox.classList.remove("bg-white");
    checkbox.classList.remove("border-gray-400");
    checkbox.classList.add("bg-yellow-400");
    checkbox.classList.add("border-yellow-400");
    if (task.length === 0) {
      text.classList.add("line-through");
      text.classList.add("text-gray-400");
      finishedTask++;
    } else {
      daysArray.push(task);
      console.log(daysArray);
    }
  } else {
    checkbox.classList.remove("bg-yellow-400");
    checkbox.classList.remove("border-yellow-400");
    checkbox.classList.add("bg-white");
    checkbox.classList.add("border-gray-400");
    if(task.length === 0) {
      text.classList.remove("line-through");
      text.classList.remove("text-gray-400");
      finishedTask--;
    } else {
      daysArray.pop(task);
      console.log(daysArray);
    }

  }

  if (typeof window.updateRates === "function") {
    window.updateRates();
  }
}

document.addEventListener("DOMContentLoaded", function() {
  fetch("components/add-task.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("add-task-placeholder").innerHTML = data;
      
      const days = ["SUN", "MON", "TUE","WED", "THU", "FRI", "SAT"];
      const repeatBtn = document.getElementById("repeat");
      days.forEach(day => {
        const daysBtn = document.createElement("button");
        daysBtn.type = "button";
        daysBtn.classList = "flex flex-row border border-gray-300 rounded-sm bg-white items-center gap-1 py-1 px-2";

        const input = document.createElement("div");
        input.id = day;
        input.classList = "bg-white border-2 border-gray-400 rounded-md w-6"
        input.onclick = () => lineThrough(day, day);

        const checkbox = document.createElement("img");
        checkbox.src = "../../src/assets/check.svg";
        checkbox.classList = "cursor-pointer";

        const dayText = document.createElement("p");
        dayText.innerText = day;
        dayText.classList = "text-wrap w-full self-center";

        input.appendChild(checkbox);
        daysBtn.appendChild(input);
        daysBtn.appendChild(dayText);
        repeatBtn.appendChild(daysBtn);
      });

      // Handle Form Inputs
      const form = document.getElementById("add-task-form");
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const deadline = document.getElementById("deadline").value;
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const type = document.getElementById("type").value;
        const link = document.getElementById("link").value;
        const until = document.getElementById("until").value;

        if (daysArray.length > 0) {
          const currentDay = new Date().getTime();
          console.log("Current day: " + currentDay);
          console.log(" date: " + deadline.split("-"));
        }

        daysArray = [];
      });
  });
});