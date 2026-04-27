// State variables
let currentIndex = 0;
let timerInterval;
let timeLeft = 90; // 1:30 in seconds
let isTimerRunning = false;

// DOM Elements
const timerEl = document.getElementById('timer');
const topicSelector = document.getElementById('topic-selector');
const unitTitleEl = document.getElementById('unit-title');
const questionTextEl = document.getElementById('question-text');
const scriptTextEl = document.getElementById('script-text');
const nextBtn = document.getElementById('next-btn');
const cardEl = document.getElementById('main-content');

// Modal Elements
const modal = document.getElementById('explanation-modal');
const closeModalBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const legendGrammar = document.querySelector('.legend-grammar');
const legendVocab = document.querySelector('.legend-vocab');

// --- Initialization ---
function init() {
    populateDropdown();
    loadTopic(currentIndex);
    
    // Event Listeners
    topicSelector.addEventListener('change', (e) => {
        currentIndex = parseInt(e.target.value);
        loadTopic(currentIndex);
    });

    // Next button
    nextBtn.addEventListener('click', nextTopic);

    // Timer click listener
    timerEl.addEventListener('click', toggleTimer);

    // Modal click listeners
    legendGrammar.addEventListener('click', (e) => {
        e.stopPropagation(); 
        openModal('Grammar Points', topicsData[currentIndex].grammar);
    });

    legendVocab.addEventListener('click', (e) => {
        e.stopPropagation(); 
        openModal('Vocabulary Meanings', topicsData[currentIndex].vocabulary);
    });

    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // Close modal when clicking on the dark overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// --- Topic Logic ---
function populateDropdown() {
    topicsData.forEach((topic, index) => {
        const option = document.createElement('option');
        option.value = index;
        const shortQuestion = topic.question.length > 50 
            ? topic.question.substring(0, 50) + "..." 
            : topic.question;
        option.textContent = `${topic.unit} - ${shortQuestion}`;
        topicSelector.appendChild(option);
    });
}

function loadTopic(index) {
    const topic = topicsData[index];
    topicSelector.value = index;
    unitTitleEl.textContent = topic.unit;
    questionTextEl.textContent = topic.question;
    
    let formattedScript = topic.script;

    const highlightPhrases = (items, className) => {
        const phrases = items.map(item => typeof item === 'object' ? item.term : item);
        const sortedPhrases = phrases.sort((a, b) => b.length - a.length);
        
        sortedPhrases.forEach(phrase => {
            const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regexReady = escapedPhrase.replace(/\\\.\\\.\\\./g, '.*?'); 
            const regex = new RegExp(`(${regexReady})`, 'gi');
            formattedScript = formattedScript.replace(regex, `<span class="${className}">$1</span>`);
        });
    };

    highlightPhrases(topic.grammar, 'highlight-grammar');
    highlightPhrases(topic.vocabulary, 'highlight-vocab');

    scriptTextEl.innerHTML = formattedScript;
}

function nextTopic() {
    currentIndex++;
    if (currentIndex >= topicsData.length) currentIndex = 0;
    loadTopic(currentIndex);
}

// --- Timer Logic ---
function toggleTimer(e) {
    e.stopPropagation();
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeLeft = 90;
        updateTimerDisplay();
        timerEl.classList.remove('running');
    } else {
        isTimerRunning = true;
        timerEl.classList.add('running');
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                timerEl.classList.remove('running');
            }
        }, 1000);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// --- Modal Logic ---
function openModal(title, items) {
    modalTitle.textContent = title;
    modalBody.innerHTML = ''; 

    if (!items || items.length === 0) {
        modalBody.innerHTML = '<p>No items found.</p>';
    } else {
        items.forEach(item => {
            const p = document.createElement('p');
            if (typeof item === 'object') {
                p.innerHTML = `<strong>${item.term}:</strong> ${item.meaning}`;
            } else {
                p.innerHTML = `<strong>${item}</strong>`;
            }
            modalBody.appendChild(p);
        });
    }
    modal.classList.remove('hidden');
}

// Boot up the app
init();
