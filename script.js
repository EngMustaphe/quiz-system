document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Fetch Quiz Data Logic
    // ==========================================================================
    
    // Fallback Mock Data if page is launched standalone (for testing)
    const DEFAULT_SCORE = 8;
    const DEFAULT_TOTAL = 10;

    // Try reading data from URL search parameters first (e.g., result.html?score=8&total=10)
    const urlParams = new URLSearchParams(window.location.search);
    let score = urlParams.get('score');
    let total = urlParams.get('total');

    // If parameters don't exist, try falling back to localStorage variables
    if (score === null || total === null) {
        score = localStorage.getItem('quizScore');
        total = localStorage.getItem('quizTotalQuestions');
    }

    // Convert values to actual integers, using default mock metrics if missing
    score = score !== null ? parseInt(score, 10) : DEFAULT_SCORE;
    total = total !== null ? parseInt(total, 10) : DEFAULT_TOTAL;

    // Safety handling to prevent division by zero errors
    if (total <= 0) total = 10;
    
    // Compute percentage directly
    const percentage = Math.round((score / total) * 100);

    // ==========================================================================
    // 2. High Score Storage Integration
    // ==========================================================================
    let currentHighScore = localStorage.getItem('quizHighScore') || 0;
    if (percentage > currentHighScore) {
        currentHighScore = percentage;
        localStorage.setItem('quizHighScore', currentHighScore);
    }

    // ==========================================================================
    // 3. Dynamic UI Render Logic
    // ==========================================================================
    const isPass = percentage >= 50;
    
    // Assign Performance Strings & Color Profiles
    let performanceText = '';
    let themeColor = '';

    if (percentage >= 90) {
        performanceText = "Excellent Work! 🏆";
        themeColor = "#10b981"; // Emerald
    } else if (percentage >= 70) {
        performanceText = "Great Job! 🎉";
        themeColor = "#3b82f6"; // Blue
    } else if (percentage >= 50) {
        performanceText = "Good Try! 👍";
        themeColor = "#f59e0b"; // Amber
    } else {
        performanceText = "Keep Practicing! 💪";
        themeColor = "#ef4444"; // Red
    }

    // Dom Elements Extraction
    const scoreTextEl = document.getElementById('score-text');
    const statusBadgeEl = document.getElementById('status-badge');
    const messageEl = document.getElementById('performance-message');
    const highScoreEl = document.getElementById('high-score-text');
    const percentTextEl = document.getElementById('percentage-text');
    const progressCircle = document.querySelector('.progress-ring__circle');

    // Render Basic Text Elements
    scoreTextEl.textContent = `${score}/${total}`;
    messageEl.textContent = performanceText;
    messageEl.style.color = themeColor;
    highScoreEl.textContent = `${currentHighScore}%`;
    
    if (isPass) {
        statusBadgeEl.textContent = "PASS ✅";
        statusBadgeEl.classList.add('pass');
        // Trigger celebratory visual cascade
        initConfetti(); 
    } else {
        statusBadgeEl.textContent = "FAIL ❌";
        statusBadgeEl.classList.add('fail');
    }

    // ==========================================================================
    // 4. SVG Circular Progress Ring Animation
    // ==========================================================================
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Map SVG structural bounds
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;
    progressCircle.style.stroke = themeColor;

    // Trigger smooth execution path delay to give CSS transitions room to fire
    setTimeout(() => {
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        
        // Increment percentage display counter progressively
        let counter = 0;
        const speed = 1200 / percentage; // match transition limit (1.2s total)
        
        if(percentage === 0) {
            percentTextEl.textContent = "0%";
            return;
        }

        const counterInterval = setInterval(() => {
            counter++;
            percentTextEl.textContent = `${counter}%`;
            if (counter >= percentage) {
                clearInterval(counterInterval);
            }
        }, speed);
    }, 150);

    // ==========================================================================
    // 5. Button Navigation Routing Hooks
    // ==========================================================================
    document.getElementById('retry-btn').addEventListener('click', () => {
        // Redirect to your friend's quiz initialization file name
        window.location.href = 'quiz.html'; 
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        // Route to home index configuration page landing terminal
        window.location.href = 'index.html'; 
    });
});

// ==========================================================================
// 6. Vanilla Canvas Confetti System Animation
// ==========================================================================
function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    // Resize viewport container dynamically
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            radius: Math.random() * 4 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 2,
            rotationSpeed: Math.random() * 0.02 - 0.01
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p) => {
            p.y += p.speed;
            p.x += Math.sin(p.angle);
            p.angle += p.rotationSpeed;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Continue rendering loop animation frame matrix arrays until items exit visual pane
        if (particles.some(p => p.y < canvas.height)) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    render();

    // Adjust sizes seamlessly on client display screen dimension resize events
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}