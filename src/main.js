import { app, db, collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", function() {
  fetch("pages/header.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
  });
});

// Fetch Data
let tasks = [];
// document.addEventListener("DOMContentLoaded", async function () {
const fetchTasks = async () => {
  try {
    const docRef = doc(db, "tasks", "myTasks");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document Data:", docSnap.data());
      tasks = docSnap.data().tasks || []; // Store fetched tasks
      console.log("Tasks:", tasks);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
};

// });

let finishedTask = 0;
const daysArray = [];

// PROGRESS FUNCTIONS
document.addEventListener("DOMContentLoaded", function() {
  fetch("components/progress.html")
  .then(response => response.text())
  .then(data => {
      document.getElementById("progress-placeholder").innerHTML = data;
      const logo = document.getElementById("greetings-logo");

      // Get current time and date
      const currentTime = new Date().getHours();
      let time;

      if (currentTime < 12) {
        logo.src = "./assets/bi--cloud-sun-fill 1.svg";
        time = "Good morning, Alvin! Rise and shine, ready to tackle the day ahead with enthusiasm and positivity?";
      } else if (currentTime < 18) {
        logo.src = "./assets/icons8-partly-cloudy-day-50.png";
        time = "Good afternoon, Alvin! You're doing well, Keep it up!";
      } else {
        logo.src = "./assets/icons8-night-100.png"
        time = "Good evening, Alvin! You did a great job today. Rest well to have another great day.";
      }

      document.getElementById('current-time').innerText = time;

      const rates = document.getElementById('rated');
      const average = document.getElementById('average');

      function updateRates() {
        const taskCount = tasks.length;
        console.log('Average task count', taskCount);
        let averageTask = (finishedTask/taskCount)*100 || 0;
        console.log("Type of :", typeof(averageTask));
        if (averageTask === NaN || averageTask == Infinity){
          console.log(averageTask)
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
    taskList.classList.remove("hidden");

  } else {
    noTask.classList.add("flex");
    noTask.classList.remove("hidden");
    taskList.classList.add("hidden");
  }

  tasks.forEach((task, index) => {
    if (task.deadline === new Date().toISOString().split("T")[0] || task.repeat.includes(new Date().toISOString().split("T")[0]) ) {
      const listItem = document.createElement("li");
      listItem.classList = "flex flex-row justify-between py-3 border-b-2 border-gray-200";
      
      const leftDiv = document.createElement("div");
      leftDiv.classList = "flex flex-row gap-3 items-start ";

      const input = document.createElement("div");
      input.id = `task${index}`;
      // Click event to toggle completion
      input.onclick = () => lineThrough(`task${index}`, []);
  
      const checkbox = document.createElement("img");
      checkbox.src = "./assets/check.svg";
      checkbox.classList = "cursor-pointer";
  
      const taskText = document.createElement("p");
      taskText.innerText = task.title;

      // Apply styles if the task is completed
      if (task.complete) {
        input.classList = "bg-yellow-400 border-2 border-yellow-400 rounded-md w-8 mt-1.5"
        taskText.classList = "text-wrap w-full self-center line-through text-gray-400";
      } else {
        input.classList = "bg-white border-2 border-gray-400 rounded-md w-8 mt-1.5"
        taskText.classList = "text-wrap w-full self-center";
      }

      const rightDiv = document.createElement("div");
      rightDiv.classList = "flex flex-row items-start ";

      const editDiv = document.createElement("img");
      editDiv.src = "./assets/pencil.svg";
      editDiv.className = "cursor-pointer text-blue-500 pr-5";
      editDiv.onclick = () => {handleEditTask(index);}

      const trashDiv = document.createElement("img");
      trashDiv.src = "./assets/trash.svg";
      trashDiv.className = "cursor-pointer text-red-500 pr-5";
      trashDiv.onclick = () => {
        console.log(index);
        tasks.splice(index, 1);

        updateFirestore();
        renderTask();
        updateRates();
      };
  
      input.appendChild(checkbox);
      leftDiv.appendChild(input);
      leftDiv.appendChild(taskText);
      rightDiv.appendChild(editDiv);
      rightDiv.appendChild(trashDiv);
      listItem.appendChild(leftDiv);
      listItem.appendChild(rightDiv);
      taskList.appendChild(listItem);
    }
  });
};

// TASKS LIST FUNCTIONS
document.addEventListener("DOMContentLoaded", function () {
  let isFetched = false; // Flag to prevent multiple fetches

  if (!isFetched) {
    isFetched = true; // Mark fetch as started

    fetch("components/task.html")
      .then(response => response.text())
      .then(async (data) => {
        document.getElementById("tasks-placeholder").innerHTML = data;

        const noTask = document.getElementById("no-tasks");
        if (noTask) {
          noTask.classList.add("hidden");
        }

        const loadingSpinner = document.createElement("div");
        loadingSpinner.id = "loading-spinner";
        loadingSpinner.innerHTML = `
          <div class="flex justify-center items-center mt-5">
            <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>`;
        document.getElementById("tasks-placeholder").appendChild(loadingSpinner);

        await fetchTasks();

        loadingSpinner.remove();

        if (tasks.length === 0) {
          if (noTask) {
            noTask.classList.remove("hidden");
            noTask.classList.add("flex");
          }
        } else {
          finishedTask = tasks.filter(task => task.complete).length;
          renderTask();
          updateRates();
        }
      });
  }
});

function lineThrough(index, task) {
  const checkbox = document.getElementById(index);
  const text = checkbox.parentElement.querySelector("p");
  console.log("Text: ", text.innerText);

  if (task.length > 0) {
    if (checkbox.classList.contains("bg-white")) {
      checkbox.classList.remove("bg-yellow-400", "border-yellow-400");
      checkbox.classList.add("bg-white", "border-gray-400");
      text.classList.remove("line-through", "text-gray-400");
      daysArray.push(tasks);
      return;
    }
  }

  // Find the task by matching title
  const updateCompleteIndex = tasks.findIndex(task => task.title.toLowerCase() === text.innerText.toLowerCase());

  if (updateCompleteIndex !== -1) {
    // Toggle complete status
    tasks[updateCompleteIndex].complete = !tasks[updateCompleteIndex].complete;

    if (tasks[updateCompleteIndex].complete) {
      checkbox.classList.remove("bg-white", "border-gray-400");
      checkbox.classList.add("bg-yellow-400", "border-yellow-400");
      text.classList.add("line-through", "text-gray-400");
    } else {
      checkbox.classList.remove("bg-yellow-400", "border-yellow-400");
      checkbox.classList.add("bg-white", "border-gray-400");
      text.classList.remove("line-through", "text-gray-400");
    }

    // Update finishedTask count
    finishedTask = tasks.filter(task => task.complete).length;

    updateFirestore(tasks);

    // Ensure UI updates
    window.updateRates();
  }
}

// Update Firestore when task complete changes
async function updateFirestore(task) {
  try {
    const taskDocRef = doc(db, "tasks", "myTasks");
    await updateDoc(taskDocRef, {
      tasks: tasks
    });
    console.log("Task status updated successfully!");
  } catch (e) {
    console.error("Error updating task: ", e);
  }
}

// FORMS FUNCTIONS
function resetDaysButtons() {
  const buttons = document.querySelectorAll("#repeat button");
  buttons.forEach(button => {
    const checkbox = button.querySelector("div");
    checkbox.classList.remove("bg-yellow-400", "border-yellow-400");
    checkbox.classList.add("bg-white", "border-gray-400");
  });
  daysArray.length = 0;
}

function toggleDaySelection(input, task) {
  if (input.classList.contains("bg-white")) {
    input.classList.remove("bg-white", "border-gray-400");
    input.classList.add("bg-yellow-400", "border-yellow-400");
    daysArray.push(task);
  } else {
    input.classList.remove("bg-yellow-400", "border-yellow-400");
    input.classList.add("bg-white", "border-gray-400");
    daysArray.pop(task);
  }
  console.log("Days", daysArray);
}

function handleEditTask(taskIndex) {
  const task = tasks[taskIndex];
  console.log("TASK", taskIndex);

  // Populate the form fields with existing task data
  document.getElementById("edit-mode").value = `true-${taskIndex}`;
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("type").value = task.type;
  document.getElementById("link").value = task.link;
  // document.getElementById("deadline").value = task.deadline;
  document.getElementById("until").value = task.until;

  console.log("Setting deadline:", task.deadline);
  document.getElementById("deadline").value = task.deadline;
  console.log("After setting deadline:", document.getElementById("deadline").value);
  
  // Reset days selection and update with existing data
  resetDaysButtons();
  const days = ["SUN", "MON", "TUE","WED", "THU", "FRI", "SAT"];
  task.repeat.forEach(day => {
    const dayoftheweek = new Date(day).getDay();
    const dayButton = document.getElementById(days[dayoftheweek]);
    if (dayButton) {
      dayButton.classList.remove("bg-white", "border-gray-400");
      dayButton.classList.add("bg-yellow-400", "border-yellow-400");
      daysArray.push(dayoftheweek);
    }
  });

  document.getElementById("submit-task").innerText = "Update Task";
  
  // const form = document.getElementById("add-task-form");
  // form.addEventListener("submit", (event) => {
  //   event.preventDefault();
  //   const editMode = document.getElementById("edit-mode").value;
  //   console.log("EDIT: " + editMode);

  //   if (editMode !== "true") return;

  //   const title = document.getElementById("title").value;
  //   const taskIndex = tasks.findIndex((task) => task.title === title);

  //   if (taskIndex !== -1) {
  //     tasks[taskIndex] = {
  //       ...tasks[taskIndex],
  //       deadline: document.getElementById("deadline").value,
  //       title,
  //       description: document.getElementById("description").value,
  //       type: document.getElementById("type").value,
  //       link: document.getElementById("link").value,
  //       until: document.getElementById("until").value,
  //       updatedAt: new Date().toISOString().split("T")[0],
  //     };
  //   }

  //   // Reset edit mode and form
  //   document.getElementById("edit-mode").value = "false";
  //   resetDaysButtons();
  //   renderTask();
  //   window.updateRates();
  //   form.reset();
  // });
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
        daysBtn.classList = "flex flex-row border border-gray-300 rounded-md bg-white items-center gap-1 py-1 px-2 cursor-pointer pointer-events-auto";
        
        const input = document.createElement("div");
        input.id = day;
        input.classList = "bg-white border-2 border-gray-400 rounded-md w-6 "
        
        daysBtn.onclick = () => toggleDaySelection(input, index);
        
        const checkbox = document.createElement("img");
        checkbox.src = "./assets/check.svg";

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

        const editMode = document.getElementById("edit-mode").value;
        const deadline = document.getElementById("deadline").value;
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const type = document.getElementById("type").value;
        const link = document.getElementById("link").value;
        const until = document.getElementById("until").value;

        if (editMode.split("-")[0] !== "true") {
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
  
          const newTask = {
            id: String(Date.now()),
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
  
          tasks.unshift(newTask);
  
          const saveDB = async () => {
            try {
              const taskDocRef = doc(db, "tasks", "myTasks");
          
              await updateDoc(taskDocRef, {
                tasks: arrayUnion(newTask)
              });
          
              console.log("Task added successfully!");
            } catch (e) {
              console.error("Error adding task: ", e);
            }
          };
  
          saveDB();
          resetDaysButtons();
          renderTask();
          window.updateRates();
          form.reset();
        } else {
          const index = editMode.split("-")[1]

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

          if (index !== -1) {
            tasks[index] = {
              ...tasks[index],
              deadline: deadline,
              title,
              description: description,
              type: type,
              link: link,
              until: until,
              repeat: generatedFutureDays,
              updatedAt: new Date().toISOString().split("T")[0],
            };
          }

          const saveDB = async () => {
            try {
              const taskDocRef = doc(db, "tasks", "myTasks");
          
              await updateDoc(taskDocRef, {
                tasks
              });
          
              console.log("Task added successfully!");
            } catch (e) {
              console.error("Error adding task: ", e);
            }
          };

          // Reset edit mode and form
          saveDB();
          document.getElementById("edit-mode").value = "false";
          resetDaysButtons();
          renderTask();
          window.updateRates();
          form.reset();
        }
      });

      // Slide Functions for DAY BUTTONS
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