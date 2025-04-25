/**
 * Configuration file for modular GIF selection
 * Contains arrays of available GIFs for different elements of the page
 */
const gifConfig = {
    // GIFs for body background
    bodyBackgrounds: [
        '1712162540983642144.gif',
        'Spirale.gif',
        'AIBOOK.gif'
    ],
    
    // GIFs for first list item
    firstItemBackgrounds: [
        'ezgif-7-69b4f968e1.gif',
        'OPTIMezgif-3bdd5674441306.gif'
    ],
    
    // Options for ball overlay (could be colors or GIFs)
    ballStyles: [
        // Default white style
        {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
        },
        // Blue style
        {
            backgroundColor: 'rgba(0, 55, 255, 0.9)',
            boxShadow: '0 0 10px rgba(173, 216, 230, 0.8)'
        },
        // Custom styles with GIFs - now shows the full GIF with no glow
        {
            backgroundImage: 'url("fire.gif")',
            backgroundSize: 'contain', // 'contain' ensures the whole GIF is visible
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
            // Removed box-shadow for clean GIF display with no glow
        },
        {
            backgroundImage: 'url("aniabstractlight.gif")',
            backgroundSize: 'contain', // 'contain' ensures the whole GIF is visible
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
        },
        // Purple style
        {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 10px rgba(147, 112, 219, 0.8)'
        }
    ]
};

/**
 * Helper function to get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
