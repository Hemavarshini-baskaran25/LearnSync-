// Firebase Configuration and Initialization
const firebaseConfig = {
    apiKey: "AIzaSyC28D931UBbyOP5OJjMtwF4AKZ8jy8x2p8",
    authDomain: "learnsync-ai-7f63f.firebaseapp.com",
    projectId: "learnsync-ai-7f63f",
    storageBucket: "learnsync-ai-7f63f.appspot.com",
    messagingSenderId: "635755986578",
    appId: "1:635755986578:web:b2f6d9e10a3b3408eff04b",
    measurementId: "G-V2V20MX9M3"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", async () => {
    // Check for subject parameter in URL
    let subject = new URLSearchParams(window.location.search).get("subject");
    if (subject) {
        displayLessons(subject);
        loadLesson();
    }

    // Initialize auth state listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User logged in:", user.email);
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                name: user.displayName,
                email: user.email,
                uid: user.uid
            }));
        } else {
            console.log("No user signed in");
        }
    });

    // Registration Form Handler
    const regForm = document.getElementById('registrationForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: name });
                
                showMessage('Registration successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = "home.html", 2000);
                
            } catch (error) {
                showMessage(error.message, 'error');
                console.error("Registration error:", error);
            }
        });
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = "home.html", 1500);
            } catch (error) {
                showMessage(error.message, 'error');
                console.error("Login error:", error);
            }
        });
    }
});

// Utility Functions
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
    }
}

// Lesson Management Functions
async function loadData() {
    try {
        const response = await fetch("data.json");
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}

async function displayLessons(subject) {
    const data = await loadData(); 
    if (!data || !data.lessons[subject]) {
        console.error("No lessons found for this subject");
        return;
    }

    const container = document.getElementById("lesson-list");
    if (!container) return;

    container.innerHTML = "";
    data.lessons[subject].forEach(lesson => {
        const lessonItem = document.createElement("div");
        lessonItem.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <video src="${lesson.video}" controls></video>
            <a href="lesson.html?id=${lesson.id}&subject=${subject}">Start Lesson</a>
        `;
        container.appendChild(lessonItem);
    });
}

async function loadLesson() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get("subject");
    const data = await loadData();

    if (!data?.lessons[subject]) {
        document.body.innerHTML = "<h2>Lesson not found!</h2>";
        return;
    }

    const lesson = data.lessons[subject][0];
    document.getElementById("lesson-title").innerText = lesson.title;
    document.getElementById("lesson-content").innerText = lesson.content;

    const videoElement = document.getElementById("lesson-video");
    if (videoElement) {
        videoElement.src = subject === "maths" 
            ? "https://www.youtube.com/embed/VScM8Z8Jls0?si=DvBgWW727qEs-BMO"
            : "https://www.youtube.com/embed/al-do-HGuIk?si=Dv5s5UcptWFbnAJ-";
    }

    const quizContainer = document.getElementById("quiz-container");
    if (quizContainer) {
        quizContainer.innerHTML = "";
        lesson.quiz.forEach((q, index) => {
            const questionDiv = document.createElement("div");
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
}

// Quiz Functions
window.submitQuiz = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get("subject");
    const lessonId = urlParams.get("id");

    loadData().then(data => {
        const lesson = data.lessons[subject].find(l => l.id == lessonId);
        if (!lesson) return;

        const correctAnswers = lesson.quiz.map(q => q.correct);
        let score = 0;

        lesson.quiz.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected && selected.value === correctAnswers[index]) score++;
        });

        const resultElement = document.getElementById("quiz-result");
        if (resultElement) {
            resultElement.innerText = `Your score: ${score}/${lesson.quiz.length}`;
            if (score === lesson.quiz.length) {
                localStorage.setItem("badgeEarned", "true");
            }
        }
    });
};

window.showHint = function(index) {
    const hintElement = document.getElementById(`hint${index}`);
    if (hintElement) hintElement.style.display = "block";
};
