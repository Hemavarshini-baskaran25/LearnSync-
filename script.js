// Load lesson content when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
    let subject = new URLSearchParams(window.location.search).get("subject");
    if (subject) {
        displayLessons(subject);
        loadLesson();
    }
});
// Load lesson content when the page is loaded
document.addEventListener("DOMContentLoaded", async () => {
    let subject = new URLSearchParams(window.location.search).get("subject");
    if (subject) {
        displayLessons(subject);
        loadLesson();
    }
});

// Import Firebase Authentication
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    let user = storedUsers.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", username);
        window.location.href = "home.html";
    } else {
        document.getElementById("message").innerText = "Invalid credentials!";
    }
}

function signup() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    if (!username || !password) {
        document.getElementById("message").innerText = "Please fill in all fields!";
        return;
    }

    if (!validatePassword(password)) {
        document.getElementById("message").innerText = "Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character.";
        return;
    }

    if (storedUsers.find(u => u.username === username)) {
        document.getElementById("message").innerText = "Username already exists!";
        return;
    }

    storedUsers.push({ username, password });
    localStorage.setItem("users", JSON.stringify(storedUsers));
    document.getElementById("message").innerText = "Account created! Now login.";
}

// ✅ Function to Load JSON Data
async function loadData() {
    try {
        const response = await fetch("data.json"); // Fetch the file
        const data = await response.json(); // Convert response to JSON format
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// ✅ Display Lessons Based on Subject
async function displayLessons(subject) {
    const data = await loadData(); 
    if (!data || !data.lessons[subject]) {
        console.error("No lessons found for this subject");
        return;
    }

    const lessons = data.lessons[subject];
    const container = document.getElementById("lesson-list");

    container.innerHTML = ""; // Clear previous lessons
    lessons.forEach(lesson => {
        let lessonItem = document.createElement("div");
        lessonItem.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <video src="${lesson.video}" controls></video>
            <a href="lesson.html?id=${lesson.id}&subject=${subject}">Start Lesson</a>
        `;
        container.appendChild(lessonItem);
    });
}

// ✅ Load Lesson Content with Video and Quiz
async function loadLesson() {
    let urlParams = new URLSearchParams(window.location.search);
    let subject = urlParams.get("subject");

    let data = await loadData();

    if (!data.lessons[subject]) {
        document.body.innerHTML = "<h2>Lesson not found!</h2>";
        return;
    }

    let lesson = data.lessons[subject][0];

    document.getElementById("lesson-title").innerText = lesson.title;
    document.getElementById("lesson-content").innerText = lesson.content;

    // ✅ Assign Correct Video Based on Subject
    let videoElement = document.getElementById("lesson-video");
    if (subject === "maths") {
        videoElement.src = "https://www.youtube.com/embed/VScM8Z8Jls0?si=DvBgWW727qEs-BMO"; 
    } else if (subject === "science") {
        videoElement.src = "https://www.youtube.com/embed/al-do-HGuIk?si=Dv5s5UcptWFbnAJ-"; 
    }

    let quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = ""; // Clear previous quiz

    lesson.quiz.forEach((q, index) => {
        let questionDiv = document.createElement("div");
        questionDiv.innerHTML = `
            <p><strong>${index + 1}. ${q.question}</strong></p>
            ${q.options.map(opt => 
                `<label><input type="radio" name="q${index}" value="${opt}">${opt}</label>`
            ).join(" ")}
            <button onclick="showHint(${index})">Hint</button>
            <p id="hint${index}" style="display:none;">${q.hint}</p>
        `;
        quizContainer.appendChild(questionDiv);
    });
}

// ✅ Submit Quiz and Calculate Score
window.submitQuiz = function () {
    let urlParams = new URLSearchParams(window.location.search);
    let subject = urlParams.get("subject");
    let lessonId = urlParams.get("id");

    loadData().then(data => {
        let lesson = data.lessons[subject].find(l => l.id == lessonId);
        if (!lesson) return;

        let correctAnswers = lesson.quiz.map(q => q.correct);
        let score = 0;

        lesson.quiz.forEach((q, index) => {
            let selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected && selected.value === correctAnswers[index]) {
                score++;
            }
        });

        document.getElementById("quiz-result").innerText = `Your score: ${score}/${lesson.quiz.length}`;

        if (score === lesson.quiz.length) {
            localStorage.setItem("badgeEarned", "true");
        }
    });
};

// ✅ Show Hint for Individual Question
window.showHint = function (index) {
    let hintElement = document.getElementById(`hint${index}`);
    hintElement.style.display = "block";
};



// Function to load data from JSON
async function loadData() {
    try {
        const response = await fetch("data.json"); // Fetch the file
        const data = await response.json(); // Convert response to JSON format
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Function to display lessons
async function displayLessons(subject) {
    const data = await loadData(); // Load JSON data
    if (!data || !data.lessons[subject]) {
        console.error("No lessons found for this subject");
        return;
    }

    const lessons = data.lessons[subject];
    const container = document.getElementById("lesson-list");

    container.innerHTML = ""; // Clear previous lessons
    lessons.forEach(lesson => {
        let lessonItem = document.createElement("div");
        lessonItem.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <video src="${lesson.video}" controls></video>
            <a href="lesson.html?id=${lesson.id}&subject=${subject}">Start Lesson</a>
        `;
        container.appendChild(lessonItem);
    });
}

// Function to load lesson content
async function loadLesson() {
    let urlParams = new URLSearchParams(window.location.search);
    let subject = urlParams.get("subject");

    let response = await fetch("data.json");
    let data = await response.json();

    if (!data.lessons[subject]) {
        document.body.innerHTML = "<h2>Lesson not found!</h2>";
        return;
    }
    let lesson = data.lessons[subject][0];

    document.getElementById("lesson-title").innerText = lesson.title;
    document.getElementById("lesson-content").innerText = lesson.content;

    // Assign correct video based on subject
    let videoSrc = "";
    if (subject === "maths") {
        videoSrc = "https://www.youtube.com/embed/VScM8Z8Jls0?si=DvBgWW727qEs-BMO"; // Example video for Maths
    } else if (subject === "science") {
        videoSrc = "https://www.youtube.com/embed/al-do-HGuIk?si=Dv5s5UcptWFbnAJ-"; // Example video for Science
    }


    let quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = ""; // Clear previous quiz

    lesson.quiz.forEach((q, index) => {
        let questionDiv = document.createElement("div");
        questionDiv.innerHTML = `
            <p><strong>${index + 1}. ${q.question}</strong></p>
            ${q.options.map(opt => 
                `<label><input type="radio" name="q${index}" value="${opt}"> ${opt}</label>`
            ).join("<br>")}
        `;
        quizContainer.appendChild(questionDiv);
    });
}

// Function to submit quiz and calculate score
function submitQuiz() {
    let urlParams = new URLSearchParams(window.location.search);
    let subject = urlParams.get("subject");
    let lessonId = urlParams.get("id");

    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            let lesson = data.lessons[subject].find(l => l.id == lessonId);
            if (!lesson) return;

            let correctAnswers = lesson.quiz.map(q => q.correct);
            let score = 0;

            lesson.quiz.forEach((q, index) => {
                let selected = document.querySelector(`input[name="q${index}"]:checked`);
                if (selected && selected.value === correctAnswers[index]) {
                    score++;
                }
            });

            document.getElementById("quiz-result").innerText = `Your score: ${score}/${lesson.quiz.length}`;

            if (score === lesson.quiz.length) {
                localStorage.setItem("badgeEarned", "true");
            }
        });
}



function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    let user = storedUsers.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("loggedInUser", username);
        window.location.href = "home.html";  // Redirect to home page
    } else {
        document.getElementById("message").innerText = "Invalid credentials!";
    }
}

