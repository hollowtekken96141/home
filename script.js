const ballsOverlay = document.createElement('div');
ballsOverlay.id = 'balls-overlay';
document.body.appendChild(ballsOverlay);

const balls = [];

function spawnBalls(count, isAtTop) {
    for (let i = 0; i < count * 2; i++) { // Spawn twice as many balls
        const ball = document.createElement('div');
        ball.classList.add('ball');
        const size = 10 + Math.random() * 20; // Random sizes between 10px and 30px
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.top = `${Math.random() * 50}px`; // Keep balls near the top
        ball.style.left = `${Math.random() * window.innerWidth}px`;
        ballsOverlay.appendChild(ball);

        balls.push({
            element: ball,
            opacity: isAtTop ? 1 : 0.7, // Higher opacity at the top
            vy: Math.random() * 0.05 + 0.05 // Slow downward drift influenced by scroll momentum
        });
    }
}


// Initial spawn of balls
window.addEventListener('load', () => {
    spawnBalls(10, true); // Spawn 10 balls when the page is first loaded
});

// Handle scrolling
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.05; // Slower impact of scroll momentum

    // Continuously spawn balls near the top while scrolling
    spawnBalls(1, currentScrollY < 50);

    lastScrollY = currentScrollY;
}, { passive: true });

// Animate the balls
function animateBalls() {
    balls.forEach((ball, index) => {
        const rect = ball.element.getBoundingClientRect();

        // Update positions
        let newTop = rect.top + ball.vy + scrollVelocity;

        // Decay opacity as balls move downward
        if (newTop > window.innerHeight) {
            ball.opacity -= 0.005;
        }

        // Remove invisible balls
        if (ball.opacity <= 0) {
            ball.element.remove();
            balls.splice(index, 1);
            return;
        }

        // Apply new styles
        ball.element.style.transform = `translateY(${newTop}px)`;
        ball.element.style.opacity = ball.opacity.toFixed(2);
    });

    // Decay scroll velocity
    scrollVelocity *= 0.9;

    requestAnimationFrame(animateBalls);
}

// Start animation loop
animateBalls();
