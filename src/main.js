document.addEventListener("DOMContentLoaded", function() {
  fetch("pages/header.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
  });
});

const tasks = [{
  title: "hi",
  deadline: "2025-03-04",
  completed: false,
  repeat: ["2025-03-04", "2025-03-05"]
}];
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

      function updateRates() {
        const taskCount = tasks.length;
        console.log('Average task count', taskCount);
        const averageTask = (finishedTask/taskCount)*100 || 0;
        if (averageTask == NaN){
          averageTask = 0;
        }
        rates.innerText = `${finishedTask}/${taskCount}`;
        average.innerText = averageTask.toFixed(0);
        
        // Update progress bar
        const progressBar = document.getElementById("progress");
        progressBar.style.width = `${averageTask}%`;

        updateTodayDues();
        updateIncomingDues();
        updatePastDues();
      }

      updateRates();

      // Store updateRates function globally
      window.updateRates = updateRates;
  });
});

function updateTodayDues() {
  const todayDue = document.getElementById("today");
  const todayDate = new Date().toISOString().split("T")[0];

  todayDue.innerText = tasks.filter(task => task.deadline === todayDate).length;
}

function updateIncomingDues() {
  const incomingDue = document.getElementById("incoming");
  const currentDate = new Date().toISOString().split("T")[0];

  incomingDue.innerText = tasks.filter(task => task.deadline > currentDate).length;
}

function updatePastDues() {
  const pastDue = document.getElementById("past-dues");
  const currentDate = new Date().toISOString().split("T")[0];

  pastDue.innerText = tasks.filter(task => task.deadline < currentDate).length;
}

function renderTask() {
  const taskList = document.getElementById("task-list");
  const noTask = document.getElementById("no-tasks");
  
  const todayTasks = tasks.filter(task => task.deadline === new Date().toISOString().split("T")[0] || task.repeat.includes(new Date().toISOString().split("T")[0]));

  if (todayTasks.length > 0) {
    taskList.innerHTML = "";
    noTask.classList.remove("flex");
    noTask.classList.add("hidden");
  } else {
    noTask.classList.add("flex");
    noTask.classList.remove("hidden");
  }

  const reverseTasks = tasks.reverse();

  reverseTasks.forEach((task, index) => {
    if (task.deadline === new Date().toISOString().split("T")[0] || task.repeat.includes(new Date().toISOString().split("T")[0]) ) {
      const listItem = document.createElement("li");
      listItem.classList = "flex flex-row justify-between py-3 border-b-2 border-gray-200";
      
      const leftDiv = document.createElement("div");
      leftDiv.classList = "flex flex-row gap-3 items-start ";

      const input = document.createElement("div");
      input.id = `task${index}`;
      input.classList = "bg-white border-2 border-gray-400 rounded-md w-8 mt-1.5"
      input.onclick = () => lineThrough(`task${index}`, []);
  
      const checkbox = document.createElement("img");
      checkbox.src = "../../src/assets/check.svg";
      checkbox.classList = "cursor-pointer";
  
      const taskText = document.createElement("p");
      taskText.innerText = task.title;
      taskText.classList = "text-wrap w-full self-center";

      const rightDiv = document.createElement("img");
      rightDiv.src = "../../src/assets/trash.svg";
      rightDiv.className = "cursor-pointer text-red-500 pr-5";
      rightDiv.onclick = () => {
        console.log(index);
        tasks.splice(index, 1);

        renderTask();
        updateRates();
      };
  
      input.appendChild(checkbox);
      leftDiv.appendChild(input);
      leftDiv.appendChild(taskText);
      listItem.appendChild(leftDiv);
      listItem.appendChild(rightDiv);
      taskList.appendChild(listItem);
    }
  });
};

document.addEventListener("DOMContentLoaded", function() {
  fetch("components/task.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("tasks-placeholder").innerHTML = data;
      

      console.log(tasks.length);
      
      if (tasks.length === 0) {
        const noTask = document.getElementById("no-tasks");
        noTask.classList.add("flex");
        noTask.classList.remove("hidden");
      } else {
        renderTask();
      }

    });
});

function lineThrough(index, task) {
  const checkbox = document.getElementById(index);
  const text = checkbox.parentElement.querySelector("p");

  const updateComplete = tasks.find(task => task.title.toLowerCase().includes(text.innerText.toLowerCase()));

  if (checkbox.classList.contains("bg-white")) {
    checkbox.classList.remove("bg-white");
    checkbox.classList.remove("border-gray-400");
    checkbox.classList.add("bg-yellow-400");
    checkbox.classList.add("border-yellow-400");
    
    if (task.length === 0) {
      text.classList.add("line-through");
      text.classList.add("text-gray-400");
      
      updateComplete.complete = true;
      finishedTask = tasks.filter((task) => task.complete === true).length;
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
      
      updateComplete.complete = false;
      finishedTask = tasks.filter((task) => task.complete === true).length;
    } else {      
      daysArray.pop(task);
      console.log(daysArray);
    }

  }

  if (typeof window.updateRates === "function") {
    window.updateRates();
  }
}

function resetDaysButtons() {
  const buttons = document.querySelectorAll("#repeat button");
  buttons.forEach(button => {
    const checkbox = button.querySelector("div");
    checkbox.classList.remove("bg-yellow-400", "border-yellow-400");
    checkbox.classList.add("bg-white", "border-gray-400");
  });
  daysArray.length = 0;
}

document.addEventListener("DOMContentLoaded", function() {
  fetch("components/add-task.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("add-task-placeholder").innerHTML = data;
      
      const days = ["SUN", "MON", "TUE","WED", "THU", "FRI", "SAT"];
      const repeatBtn = document.getElementById("repeat");
      days.forEach((day, index) => {
        const daysBtn = document.createElement("button");
        daysBtn.type = "button";
        daysBtn.classList = "flex flex-row border border-gray-300 rounded-md bg-white items-center gap-1 py-1 px-2";

        const input = document.createElement("div");
        input.id = day;
        input.classList = "bg-white border-2 border-gray-400 rounded-md w-6"
        input.onclick = () => lineThrough(day, index);

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
        
        const alertDiv = document.getElementById("alert");

        if (!deadline || !until) {
          alertDiv.classList.remove("hidden");
          alertDiv.innerText = "Please enter a deadline and until date.";
          setTimeout(() => {
            alertDiv.classList.add("hidden");
          }, 5000);
          return;
        }
        
        if (daysArray.length === 0) {
          alertDiv.classList.remove("hidden");
          alertDiv.innerText = "Please choose atleast one day of the week.";
          setTimeout(() => {
            alertDiv.classList.add("hidden");
          }, 5000);
          return;
        }

        const currentDay = new Date(deadline).getTime();
        const untilDay = new Date(until).getTime();

        if (currentDay < untilDay) {
          alertDiv.classList.remove("hidden");
          alertDiv.innerText = "The until date should be before the deadline.";
          setTimeout(() => {
            alertDiv.classList.add("hidden");
          }, 5000);
          return;
        }

        const generatedFutureDays = [];
        const oneDay = 24 * 60 * 60 * 1000;

        let nextDay = new Date().getTime();

        // Iterate until reaching `untilDay`
        while (nextDay <= untilDay) {
          // Check if the day is in the daysArray selected
          const generatedDay = new Date(nextDay);
          if (daysArray.includes(generatedDay.getDay())) {
            generatedFutureDays.push(generatedDay.toISOString().split("T")[0]);
          }
          nextDay += oneDay;
        }
        
        console.log("Generated Future Dates", generatedFutureDays);
        console.log("Current day: " + currentDay);
        console.log("until day: " + untilDay);

        const newTask = {
          deadline: deadline,
          title: title,
          description: description,
          type: type,
          link: link,
          repeat: generatedFutureDays,
          until: until,
          complete: false,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        }

        tasks.push(newTask);

        resetDaysButtons();
        renderTask();
        window.updateRates();
        form.reset();
      });

      let container = document.querySelector(".repeat-container");
      let innerContainer = document.querySelector("#repeat");
      let pressed = false;
      let startX;
      let x;

      container.addEventListener("mousedown", (e) => {
        pressed = true;
        startX = e.offsetX - innerContainer.offsetLeft;
        container.style.cursor = "grabbing";
      });
      
      container.addEventListener("mouseenter", () => {
          container.style.cursor = "grab";
      });
      
      container.addEventListener("mouseup", () => {
          container.style.cursor = "grab";
          pressed = false;
      });

      let boundItems = () => {
        let outer = container.getBoundingClientRect();
        let inner = innerContainer.getBoundingClientRect();
    
        if (parseInt(innerContainer.style.left) > 0) {
        innerContainer.style.left = "0px";
        }
    
        if (inner.right < outer.right) {
        innerContainer.style.left = `-${inner.width - outer.width}px`;
        }
      };

      container.addEventListener("mousemove", (e) => {
        if (!pressed) return;
        e.preventDefault();
    
        x = e.offsetX;
        innerContainer.style.left = `${x - startX}px`;
        boundItems();
      });
  });
});