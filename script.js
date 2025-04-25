// Get or create the balls overlay container
let ballsOverlay = document.getElementById('balls-overlay');
if (!ballsOverlay) {
    ballsOverlay = document.createElement('div');
    ballsOverlay.id = 'balls-overlay';
    document.body.appendChild(ballsOverlay);
}

// Store ball objects
const balls = [];

// Maximum number of balls to limit performance impact
const MAX_BALLS = 300;

// Track if the page is visible
let isPageVisible = true;

// Selected ball style for this page load
let selectedBallStyle = null;

/**
 * Creates and adds new balls to the overlay
 * @param {number} count - Base number of balls to spawn
 * @param {boolean} isAtTop - Whether we're at the top of the page
 * @param {Object} style - Optional style to apply to the balls
 */
function spawnBalls(count, isAtTop, style) {
    // Limit total number of balls for performance
    if (balls.length >= MAX_BALLS) return;
    
    // Increase the multiplier to create more balls
    const multiplier = isAtTop ? 4 : 2;
    const actualCount = Math.min(count * multiplier, MAX_BALLS - balls.length);
    
    // Use the provided style or the selected style for this page load
    const ballStyle = style || selectedBallStyle;
    
    // Check if this is a GIF-based ball style
    const hasGifBackground = ballStyle && 
                            ballStyle.backgroundImage && 
                            ballStyle.backgroundImage.includes('.gif');
    
    for (let i = 0; i < actualCount; i++) {
        try {
            let element;
            const size = 10 + Math.random() * 20; // Random sizes between 10px and 30px
            const top = `${Math.random() * 50}px`; // Keep balls near the top
            const left = `${Math.random() * window.innerWidth}px`;
            
            if (hasGifBackground) {
                // Create a container for the GIF background
                const container = document.createElement('div');
                container.classList.add('ball-container');
                
                // Set size for the container - make it larger to show more of the GIF
                const containerSize = size * 2; // Double the size to show more of the GIF
                container.style.width = `${containerSize}px`;
                container.style.height = `${containerSize}px`;
                container.style.top = top;
                container.style.left = left;
                
                // Apply the GIF background to the container
                Object.assign(container.style, ballStyle);
                
                // Create the inner ball element for the glow effect
                const innerBall = document.createElement('div');
                innerBall.classList.add('ball-inner');
                container.appendChild(innerBall);
                
                ballsOverlay.appendChild(container);
                element = container;
            } else {
                // Create a regular ball
                const ball = document.createElement('div');
                ball.classList.add('ball');
                ball.style.width = `${size}px`;
                ball.style.height = `${size}px`;
                ball.style.top = top;
                ball.style.left = left;
                
                // Apply custom style if available
                if (ballStyle) {
                    Object.assign(ball.style, ballStyle);
                }
                
                ballsOverlay.appendChild(ball);
                element = ball;
            }

            // For GIF balls, always use full opacity; for regular balls, vary opacity based on position
            const initialOpacity = hasGifBackground ? 1 : (isAtTop ? 1 : 0.7);
            
            balls.push({
                element: element,
                opacity: initialOpacity,
                vy: Math.random() * 0.05 + 0.05 // Slow downward drift
            });
        } catch (error) {
            console.error('Error creating ball:', error);
        }
    }
}

// Track scroll position and velocity
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

// Set random backgrounds and initialize balls on page load
window.addEventListener('load', () => {
    // Check if we're using CSS from a subdirectory and adjust paths accordingly
    const cssPathPrefix = document.querySelector('link[href^="css/"]') ? './' : '';
    
    // Set random body background
    const bodyBg = getRandomItem(gifConfig.bodyBackgrounds);
    document.documentElement.style.setProperty('--body-background', `url("${cssPathPrefix}${bodyBg}")`);
    console.log(`Selected body background: ${bodyBg}`);
    
    // Set random first item background
    const firstItemBg = getRandomItem(gifConfig.firstItemBackgrounds);
    document.documentElement.style.setProperty('--first-item-background', `url('${cssPathPrefix}${firstItemBg}')`);
    console.log(`Selected first item background: ${firstItemBg}`);
    
    // Update all list item background images with the correct path prefix
    if (cssPathPrefix) {
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                if (!rules) continue;
                
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.style && rule.style.backgroundImage && 
                        rule.style.backgroundImage.includes('url(') && 
                        !rule.style.backgroundImage.includes('var(')) {
                        
                        // Extract the filename from the url()
                        const bgMatch = rule.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                        if (bgMatch && bgMatch[1] && !bgMatch[1].startsWith('./') && !bgMatch[1].startsWith('../')) {
                            // Replace with prefixed path
                            rule.style.backgroundImage = `url('${cssPathPrefix}${bgMatch[1]}')`;
                        }
                    }
                }
            } catch (e) {
                console.error('Error updating CSS paths:', e);
            }
        }
    }
    
    // Random selection of ball style
    selectedBallStyle = getRandomItem(gifConfig.ballStyles);
    console.log('Selected ball style:', selectedBallStyle);
    
    // Initial spawn of balls with selected style
    spawnBalls(50, true, selectedBallStyle);
});

// Handle scrolling - more responsive now
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.1;
    
    // Spawn balls on every scroll event with the selected style
    spawnBalls(2, currentScrollY < 50, selectedBallStyle);

    lastScrollY = currentScrollY;
}, { passive: true });

// Page visibility API to pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    isPageVisible = document.visibilityState === 'visible';
});

// Animate the balls
function animateBalls(timestamp) {
    // Skip animation if page is not visible
    if (!isPageVisible) {
        requestAnimationFrame(animateBalls);
        return;
    }
    
    // Use for...of instead of forEach for better performance when removing items
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        try {
            const rect = ball.element.getBoundingClientRect();

            // Update positions
            let newTop = rect.top + ball.vy + scrollVelocity;

            // Check if this is a GIF ball (ball-container class)
            const isGifBall = ball.element.classList.contains('ball-container');
            
            // Only decay opacity for non-GIF balls
            if (newTop > window.innerHeight && !isGifBall) {
                ball.opacity -= 0.01; // Faster opacity decay for better performance
            }

            // Remove invisible balls
            if (ball.opacity <= 0) {
                ball.element.remove();
                balls.splice(i, 1);
                continue;
            }

            // Apply new styles - use transform for better performance
            ball.element.style.transform = `translateY(${newTop}px)`;
            ball.element.style.opacity = ball.opacity.toFixed(2);
        } catch (error) {
            // Remove problematic ball if there's an error
            try {
                ball.element.remove();
            } catch (e) {}
            balls.splice(i, 1);
        }
    }

    // Slower decay for scroll velocity to maintain effect longer
    scrollVelocity *= 0.5; // Changed from 0.1 to 0.5

    // Continue animation loop
    requestAnimationFrame(animateBalls);
}

// Start animation loop
requestAnimationFrame(animateBalls);
