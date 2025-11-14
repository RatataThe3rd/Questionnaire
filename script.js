const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const configForm = document.getElementById('config-form');
const quizContainer = document.querySelector('.quiz-container');
const configContainer = document.querySelector('.config-container');
const quizCreatorContainer = document.querySelector('.quiz-creator-container');
const quizTitleDisplay = document.getElementById('quiz-title-display');
const progressText = document.getElementById('progress-text');

// Quiz type selection elements
const quizTypeSelect = document.getElementById('quiz-type');
const onlineConfig = document.querySelector('.online-config');
const customConfig = document.getElementById('custom-config');

// Custom quiz elements
const createQuizBtn = document.getElementById('create-quiz-btn');
const playCustomBtn = document.getElementById('play-custom-btn');
const savedQuizzesDiv = document.getElementById('saved-quizzes');
const quizListDiv = document.getElementById('quiz-list');

// Quiz creator elements
const quizCreatorForm = document.getElementById('quiz-creator-form');
const quizTitleInput = document.getElementById('quiz-title');
const questionTextInput = document.getElementById('question-text');
const correctAnswerInput = document.getElementById('correct-answer');
const wrongAnswer1Input = document.getElementById('wrong-answer-1');
const wrongAnswer2Input = document.getElementById('wrong-answer-2');
const wrongAnswer3Input = document.getElementById('wrong-answer-3');
const addQuestionBtn = document.getElementById('add-question-btn');
const saveQuizBtn = document.getElementById('save-quiz-btn');
const cancelCreateBtn = document.getElementById('cancel-create-btn');
const questionsListDiv = document.getElementById('questions-list');
const questionCountSpan = document.getElementById('question-count');

let currentQuestionIndex = 0;
let questions = [];
let currentQuiz = { title: '', questions: [] };
let score = 0;
let isCustomQuiz = false;

// Event Listeners
quizTypeSelect.addEventListener('change', handleQuizTypeChange);
createQuizBtn.addEventListener('click', showQuizCreator);
playCustomBtn.addEventListener('click', showSavedQuizzes);
cancelCreateBtn.addEventListener('click', hideQuizCreator);
addQuestionBtn.addEventListener('click', addQuestionToQuiz);
quizCreatorForm.addEventListener('submit', saveCustomQuiz);
restartButton.addEventListener('click', goBackToConfig);

configForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const numQuestions = document.getElementById('num-questions').value;
    const category = document.getElementById('category').value;

    isCustomQuiz = false;
    fetchQuestions(numQuestions, category);
    hideAllContainers();
    quizContainer.classList.remove('hidden');
    quizTitleDisplay.textContent = 'Online Trivia Quiz';
});

function handleQuizTypeChange() {
    const quizType = quizTypeSelect.value;
    
    if (quizType === 'online') {
        onlineConfig.classList.remove('hidden');
        customConfig.classList.add('hidden');
    } else {
        onlineConfig.classList.add('hidden');
        customConfig.classList.remove('hidden');
    }
}

function hideAllContainers() {
    configContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    quizCreatorContainer.classList.add('hidden');
}

function showQuizCreator() {
    hideAllContainers();
    quizCreatorContainer.classList.remove('hidden');
    currentQuiz = { title: '', questions: [] };
    updateQuestionsList();
}

function hideQuizCreator() {
    hideAllContainers();
    configContainer.classList.remove('hidden');
    clearQuizCreatorForm();
}

function goBackToConfig() {
    hideAllContainers();
    configContainer.classList.remove('hidden');
    score = 0;
    currentQuestionIndex = 0;
}

function showSavedQuizzes() {
    loadSavedQuizzes();
    savedQuizzesDiv.classList.remove('hidden');
}

function clearQuizCreatorForm() {
    quizTitleInput.value = '';
    questionTextInput.value = '';
    correctAnswerInput.value = '';
    wrongAnswer1Input.value = '';
    wrongAnswer2Input.value = '';
    wrongAnswer3Input.value = '';
    currentQuiz = { title: '', questions: [] };
    updateQuestionsList();
}

function addQuestionToQuiz() {
    const questionText = questionTextInput.value.trim();
    const correctAnswer = correctAnswerInput.value.trim();
    const wrongAnswer1 = wrongAnswer1Input.value.trim();
    const wrongAnswer2 = wrongAnswer2Input.value.trim();
    const wrongAnswer3 = wrongAnswer3Input.value.trim();

    if (!questionText || !correctAnswer || !wrongAnswer1 || !wrongAnswer2 || !wrongAnswer3) { 
        alert('Please fill in all fields for the question.');
        return;
    }

    const question = {
        question: questionText,
        correct_answer: correctAnswer,
        incorrect_answers: [wrongAnswer1, wrongAnswer2, wrongAnswer3]
    };

    currentQuiz.questions.push(question);
    
    // Clear the form
    questionTextInput.value = '';
    correctAnswerInput.value = '';
    wrongAnswer1Input.value = '';
    wrongAnswer2Input.value = '';
    wrongAnswer3Input.value = '';

    updateQuestionsList();
    updateSaveButtonState();
}

function updateQuestionsList() {
    questionCountSpan.textContent = `(${currentQuiz.questions.length})`;
    questionsListDiv.innerHTML = '';

    currentQuiz.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p><strong>Q:</strong> ${question.question}</p>
            <p class="correct-answer"><strong>Correct:</strong> ${question.correct_answer}</p>
            <p class="wrong-answers"><strong>Wrong:</strong> ${question.incorrect_answers.join(', ')}</p>
            <button onclick="removeQuestion(${index})">Remove Question</button>
        `;
        questionsListDiv.appendChild(questionDiv);
    });

    updateSaveButtonState();
}

function removeQuestion(index) {
    currentQuiz.questions.splice(index, 1);
    updateQuestionsList();
}

function updateSaveButtonState() {
    const hasTitle = quizTitleInput.value.trim().length > 0;
    const hasQuestions = currentQuiz.questions.length > 0;
    saveQuizBtn.disabled = !(hasTitle && hasQuestions);
}

// Add event listener to quiz title input
quizTitleInput.addEventListener('input', updateSaveButtonState);

function saveCustomQuiz(event) {
    event.preventDefault();
    
    const title = quizTitleInput.value.trim();
    if (!title) {
        alert('Please enter a quiz title.');
        return;
    }

    if (currentQuiz.questions.length === 0) {
        alert('Please add at least one question.');
        return;
    }

    currentQuiz.title = title;
    
    // Save to localStorage
    const savedQuizzes = getSavedQuizzes();
    const quizId = Date.now().toString();
    savedQuizzes[quizId] = {
        ...currentQuiz,
        id: quizId,
        createdAt: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('customQuizzes', JSON.stringify(savedQuizzes));
    
    alert(`Quiz "${title}" saved successfully!`);
    hideQuizCreator();
}

function getSavedQuizzes() {
    const saved = localStorage.getItem('customQuizzes');
    return saved ? JSON.parse(saved) : {};
}

function loadSavedQuizzes() {
    const savedQuizzes = getSavedQuizzes();
    quizListDiv.innerHTML = '';
    
    const quizzes = Object.values(savedQuizzes);
    
    if (quizzes.length === 0) {
        quizListDiv.innerHTML = '<p>No saved quizzes found. Create your first quiz!</p>';
        return;
    }
    
    quizzes.forEach(quiz => {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-item';
        quizDiv.innerHTML = `
            <div>
                <h4>${quiz.title}</h4>
                <p>${quiz.questions.length} questions • Created: ${quiz.createdAt}</p>
            </div>
            <div class="quiz-item-actions">
                <button onclick="playCustomQuiz('${quiz.id}')">Play</button>
                <button onclick="deleteCustomQuiz('${quiz.id}')" class="delete-btn">Delete</button>
            </div>
        `;
        quizListDiv.appendChild(quizDiv);
    });
}

function playCustomQuiz(quizId) {
    const savedQuizzes = getSavedQuizzes();
    const quiz = savedQuizzes[quizId];
    
    if (!quiz) {
        alert('Quiz not found!');
        return;
    }
    
    questions = quiz.questions;
    currentQuestionIndex = 0;
    score = 0;
    isCustomQuiz = true;
    
    hideAllContainers();
    quizContainer.classList.remove('hidden');
    quizTitleDisplay.textContent = quiz.title;
    
    showQuestion();
}

function deleteCustomQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        const savedQuizzes = getSavedQuizzes();
        delete savedQuizzes[quizId];
        localStorage.setItem('customQuizzes', JSON.stringify(savedQuizzes));
        loadSavedQuizzes();
    }
}

// Fetch questions from Open Trivia Database
async function fetchQuestions(numQuestions = 10, category = '') {
    try {
        let url = `https://opentdb.com/api.php?amount=${numQuestions}&type=multiple`;
        if (category) {
            url += `&category=${category}`;
        }

        console.log('Fetching questions from URL:', url); // Debugging log

        const response = await fetch(url);
        const data = await response.json();

        console.log('API Response:', data); // Debugging log

        if (!data.results || data.results.length === 0) {
            throw new Error('No questions returned from the API');
        }

        questions = data.results;
        currentQuestionIndex = 0;
        showQuestion();
    } catch (error) {
        questionElement.textContent = 'Failed to load questions. Please try again later.';
        console.error('Error fetching questions:', error);
    }
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    questionElement.textContent = isCustomQuiz ? question.question : decodeHTML(question.question);

    // Update progress
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    const answers = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(answers);

    answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = isCustomQuiz ? answer : decodeHTML(answer);
        button.addEventListener('click', () => selectAnswer(answer === question.correct_answer));
        answersElement.appendChild(button);
    });
}

function resetState() {
    answersElement.innerHTML = '';
    nextButton.classList.add('hidden');
    restartButton.classList.add('hidden');
}

function selectAnswer(isCorrect) {
    if (isCorrect) {
        score++;
    }

    Array.from(answersElement.children).forEach(button => {
        button.disabled = true;
        const buttonText = button.textContent;
        const correctAnswerText = isCustomQuiz ? 
            questions[currentQuestionIndex].correct_answer : 
            decodeHTML(questions[currentQuestionIndex].correct_answer);
            
        if (buttonText === correctAnswerText) {
            button.style.backgroundColor = '#28a745';
        } else {
            button.style.backgroundColor = '#dc3545';
        }
    });

    nextButton.classList.remove('hidden');
    nextButton.removeEventListener('click', nextQuestion); // Remove previous listener
    nextButton.addEventListener('click', nextQuestion);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    const percentage = Math.round((score / questions.length) * 100);
    questionElement.innerHTML = `
        <h2>Quiz Completed!</h2>
        <p>Your Score: ${score} out of ${questions.length} (${percentage}%)</p>
        <p>${getScoreMessage(percentage)}</p>
    `;
    answersElement.innerHTML = '';
    nextButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
    progressText.textContent = 'Quiz Complete!';
}

function getScoreMessage(percentage) {
    if (percentage >= 90) return "Excellent! You're a quiz master! 🏆";
    if (percentage >= 70) return "Great job! Well done! 👏";
    if (percentage >= 50) return "Good effort! Keep it up! 👍";
    return "Don't give up! Practice makes perfect! 💪";
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set default quiz type
    handleQuizTypeChange();
    
    // Don't auto-fetch questions anymore
    // fetchQuestions();
});