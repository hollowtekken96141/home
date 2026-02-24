const RESPONSES = {
  correct: [
    "Ight private, you ain't completely useless!",
    "You're trying I guess...",
    "You might make it through basic after all!",
    "Keep that up and you might earn your stripes!",
    "Not bad for a civilian, private!",
    "Finally using that pea-sized brain of yours!"
  ],
  wrong: [
    "You tuff as bricks, but dumb as mud, private!",
    "My grandma can rhyme better than that!",
    "Did you leave your brain in the mess hall?",
    "Drop and give me 20, that answer was garbage!",
    "Are you trying to get latrine duty?",
    "This ain't kindergarten, shape up!"
  ],
  streakAchievements: {
    5: "Promoted to Private First Class of Rhymes!",
    10: "Look who's earning their Combat Rhyming Badge!",
    15: "Sergeant of Syllables right here!",
    20: "You're a rhyming machine, soldier!",
    25: "You're the General of Rhymes now!",
    30: "You're a rhyming legend, man.",
    35: "You're the Rhyme Master, no doubt!",
    40: "Nice dude! how long can you keep this up?",
    45: "Alright, you're just showing off now!",
    50: "You're the undisputed Rhyme King!",
    55: "You're the Rhyme God, no one can touch you!",
    60: "You're the Rhyme Emperor, bow down!",
    65: "You're the Rhyme Overlord, all hail!",
    70: "You're the Rhyme Deity, you win all the marbles!",
    75: "You're the Rhyme Supreme Being, you win everything!",
    80: "Aren't you getting tired yet?",
    85: "Maybe it's time to take a break?",
    90: "You're still going? Wow!",
    95: "The last will be first and the first will be last",
    100: "Everyone is a unique beauty bound by the fabric of creation",
    105: "The universe is a vast and beautiful place",
    110: "Hate the feeling of living in someone else's shadow",
    115: "Team meeting, Gang spit.",
    120: "Keep your head up, keep your heart strong"
  },
  nicknames: [
    "snowflake",
    "cupcake",
    "princess",
    "jellybean",
    "pumpkin",
    "sweet pea",
    "trunk nugget",
    "spit head",
    "my heart",
    "bruh"
  ]
};

function getRandomResponse(type) {
  const responses = RESPONSES[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getRandomNickname() {
  return RESPONSES.nicknames[Math.floor(Math.random() * RESPONSES.nicknames.length)];
}

function getStreakAchievement(score) {
  return RESPONSES.streakAchievements[score] || null;
}

function getIntensityBasedResponse(score, isCorrect) {
  let response = getRandomResponse(isCorrect ? 'correct' : 'wrong');
  
  // Add nickname to wrong answers
  if (!isCorrect) {
    response = response.replace('private', getRandomNickname());
  }
  
  // Check for streak achievements
  const achievement = getStreakAchievement(score);
  if (achievement) {
    response += ` ${achievement}`;
  }
  
  return response;
}

let game;
let gameState = {
  score: 0,
  currentWord: '',
  bestRhyme: '',
  rhymes: [],
  wordsUsed: [],
  usedLetters: [], // Track letters we've used
};

// Keyboard functionality
function setupKeyboard() {
  const keys = document.querySelectorAll('.key');
  const sendButton = document.getElementById('send-button');
  const imageCache = new Map();
  
  function cacheImage(src) {
    if (!imageCache.has(src)) {
      const img = new Image();
      img.src = src;
      imageCache.set(src, img);
    }
    return imageCache.get(src).src;
  }

  function getAltImageSrc(src) {
    return src.includes('1.png') ? src.replace('1.png', '2.png') : src.replace('2.png', '1.png');
  }

  function swapImage(imgElement, pressed) {
    const targetState = pressed ? '2.png' : '1.png';
    const currentState = pressed ? '1.png' : '2.png';
    imgElement.src = imgElement.src.replace(currentState, targetState);
  }

  // Cache all images upfront
  keys.forEach(key => {
    const img = key.querySelector('img');
    cacheImage(img.src);
    cacheImage(getAltImageSrc(img.src));
  });

  const mobileSendButton = document.getElementById('mobile-send-button');
  if (sendButton) {
    const sendImg = sendButton.querySelector('img');
    cacheImage(sendImg.src);
    cacheImage(getAltImageSrc(sendImg.src));
  }
  if (mobileSendButton) {
    const mobileSendImg = mobileSendButton.querySelector('img');
    cacheImage(mobileSendImg.src);
    cacheImage(getAltImageSrc(mobileSendImg.src));
  }

  function handleKeyPress(element, isPressed, event) {
    if (event) {
      event.preventDefault();
    }
    const img = element.querySelector('img');
    swapImage(img, isPressed);
    
    if (element.classList.contains('key') && isPressed) {
      const letter = element.getAttribute('data-key');
      const input = document.getElementById('user-input');
      if (letter === 'BACKSPACE') {
        input.value = input.value.slice(0, -1);
      } else if (input.value.length < 20) {
        input.value += letter.toLowerCase();
      }
    }
    
    if ((element.id === 'send-button' || element.id === 'mobile-send-button') && isPressed) {
      checkWord(game.scene.scenes[0]);
    }
  }

  keys.forEach(key => {
    key.addEventListener('mousedown', (e) => handleKeyPress(key, true, e));
    key.addEventListener('mouseup', (e) => handleKeyPress(key, false, e));
    key.addEventListener('touchstart', (e) => handleKeyPress(key, true, e));
    key.addEventListener('touchend', (e) => handleKeyPress(key, false, e));
  });

  if (sendButton) {
    sendButton.addEventListener('mousedown', (e) => handleKeyPress(sendButton, true, e));
    sendButton.addEventListener('mouseup', (e) => handleKeyPress(sendButton, false, e));
    sendButton.addEventListener('touchstart', (e) => handleKeyPress(sendButton, true, e));
    sendButton.addEventListener('touchend', (e) => handleKeyPress(sendButton, false, e));
  }
  if (mobileSendButton) {
    mobileSendButton.addEventListener('mousedown', (e) => handleKeyPress(mobileSendButton, true, e));
    mobileSendButton.addEventListener('mouseup', (e) => handleKeyPress(mobileSendButton, false, e));
    mobileSendButton.addEventListener('touchstart', (e) => handleKeyPress(mobileSendButton, true, e));
    mobileSendButton.addEventListener('touchend', (e) => handleKeyPress(mobileSendButton, false, e));
  }

  document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    const keyButton = document.querySelector(`[data-key="${key}"]`);
    const input = document.getElementById('user-input');
    if (keyButton && input.value.length < 20) {
      handleKeyPress(keyButton, true);
    } else if (e.key === 'Enter') {
      if (window.innerWidth <= 768) {
        handleKeyPress(mobileSendButton, true);
      } else {
        handleKeyPress(sendButton, true);
      }
    } else if (e.key === 'Backspace') {
      const input = document.getElementById('user-input');
      input.value = input.value.slice(0, -1);
    }
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toUpperCase();
    const keyButton = document.querySelector(`[data-key="${key}"]`);
    if (keyButton) {
      handleKeyPress(keyButton, false);
    } else if (e.key === 'Enter') {
      if (window.innerWidth <= 768) {
        handleKeyPress(mobileSendButton, false);
      } else {
        handleKeyPress(sendButton, false);
      }
    }
  });
}

// Game functionality
async function fetchDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    
    // Handle case where word isn't found
    if (data.title === "No Definitions Found") {
      return "No definition available";
    }
    
    // Extract the first definition
    const definition = data[0]?.meanings[0]?.definitions[0]?.definition || "No definition available";
    return definition;
  } catch (error) {
    console.error('Error fetching definition:', error);
    return "Definition unavailable";
  }
}

function getRandomLetter() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

async function fetchNewWord() {
  const letter = getRandomLetter();
  try {
    const response = await fetch(`https://api.datamuse.com/words?sp=${letter}*&max=10`);
    const data = await response.json();
    // Filter for words between 4 and 9 characters
    const validWords = data.filter(word => word.word.length >= 4 && word.word.length <= 9);
    return validWords.length > 0 ? validWords[Math.floor(Math.random() * validWords.length)].word : null;
  } catch (error) {
    console.error('Error fetching word from Datamuse:', error);
    return null;
  }
}

async function fetchRhymes(word) {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_rhy=${word}`);
    const data = await response.json();
    return data.map(item => ({
      word: item.word,
      score: item.score
    }));
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    return [];
  }
}

async function loadNewWord(scene) {
  let newWord = await fetchNewWord();
  let definition = null;
  let hasValidDefinition = false;
  let attempts = 0;
  const maxAttempts = 5;
  
  // Keep trying until we get a word with a valid definition or reach max attempts
  while (!hasValidDefinition && attempts < maxAttempts) {
    // If we didn't get a word or got an inappropriate length word, try again
    if (!newWord || newWord.length < 4 || newWord.length > 9) {
      newWord = await fetchNewWord();
      attempts++;
      continue;
    }
    
    // Try to fetch definition
    definition = await fetchDefinition(newWord);
    
    // If we got a valid definition, we're good to go
    if (definition && definition !== "No definition available" && definition !== "Definition unavailable") {
      hasValidDefinition = true;
    } else {
      // Otherwise try a new word
      newWord = await fetchNewWord();
      attempts++;
    }
  }

  // Fallback to default words if API fails or no word with definition found
  if (!hasValidDefinition) {
    const fallbackWords = ['time', 'star', 'blue', 'light', 'game', 'shine'];
    newWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
    definition = "A fallback definition since API couldn't find a good word.";
  }

  gameState.currentWord = newWord;
  gameState.rhymes = await fetchRhymes(newWord);

  if (gameState.rhymes.length > 0) {
    const highestScoreWord = gameState.rhymes.reduce((max, word) => word.score > max.score ? word : max, { score: -Infinity });
    gameState.bestRhyme = highestScoreWord.word;
  }
  
  // Update the definition using the global method
  if (window.updateDefinition) {
    window.updateDefinition(newWord, definition);
  }

  animateWord(scene);
}

function getRandomWordColor() {
  const rand = Math.random() * 100;
  if (rand < 70) {
    // 70% chance for desert tan/khaki shades
    const hue = 35 + Math.random() * 10; // Range for tan/khaki
    const saturation = 40 + Math.random() * 20; // Moderate saturation
    const lightness = 60 + Math.random() * 20; // Lighter shades
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else if (rand < 93) {
    // 23% chance for green shades
    const hue = 100 + Math.random() * 40; // Range of greens
    const saturation = 60 + Math.random() * 40;
    const lightness = 30 + Math.random() * 30;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else {
    // 7% chance for bright orange
    return '#FF6B00';
  }
}

function animateWord(scene) {
  const word = gameState.currentWord;
  const gameHeight = scene.scale.height;
  const gameWidth = scene.scale.width;
  const targetY = gameHeight / 4;
  const startY = gameHeight + 100;
  
  const wordColor = getRandomWordColor();
  scene.wordText.setStyle({
    font: '75px Special Elite',
    fill: wordColor,
    stroke: '#001f04',
    strokeThickness: 6,
    shadow: {
      offsetX: 12,
      offsetY: 12,
      color: wordColor,
      blur: 10,
      opacity: 0.7
    }
  });
  
  scene.wordText.setText(word);
  scene.wordText.setPosition(gameWidth / 2, startY);

  scene.tweens.add({
    targets: scene.wordText,
    y: targetY,
    ease: 'Power1',
    duration: 1000,
    delay: 500,
  });
}

function random(min, max) {
  return ~~(Math.random() * (max - min + 1) + min);
}

function animateFallingWords(scene, word) {
  const gameHeight = scene.scale.height;
  const gameWidth = scene.scale.width;
  const targetY = gameHeight - 100;
  const startY = gameHeight / 4;

  Array.from({ length: 10 }).forEach(() => {
    const fallingWord = scene.add.text(gameWidth / 2, startY, word, {
      font: '75px Special Elite',
      fill: scene.wordText.style.color,
      stroke: '#001f04',
      strokeThickness: 6,
      shadow: {
        offsetX: 12,
        offsetY: 12,
        color: scene.wordText.style.color,
        blur: 10,
        opacity: 0.7
      }
    }).setOrigin(0.5).setDepth(10); // Set higher depth to appear above other elements

    const randomX = random(50, gameWidth - 50);
    const randomY = random(50, gameHeight - 150);

    scene.tweens.add({
      targets: fallingWord,
      x: randomX,
      y: randomY,
      ease: 'Power1',
      duration: 2000,
      onComplete: () => {
        fallingWord.destroy(); // Properly remove the text instead of just making it invisible
      },
    });
  });
}

function extractFinalVowel(word) {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (let i = word.length - 1; i >= 0; i--) {
    if (vowels.includes(word[i])) {
      return word[i];
    }
  }
  return '';
}

// Add cooldown flag to gameState
let isAnimating = false;

function checkWord(scene) {
  // Prevent checking while animation is in progress
  if (isAnimating) return;
  
  const userInput = document.getElementById('user-input').value.trim().toLowerCase();
  const resultElement = document.getElementById('result');

  const currentWordVowel = extractFinalVowel(gameState.currentWord);
  const userInputVowel = extractFinalVowel(userInput);

  if (currentWordVowel === userInputVowel) {
    const response = getIntensityBasedResponse(gameState.score, true);
    resultElement.textContent = response;
    resultElement.style.color = '#FFFFFF';
    resultElement.classList.add('correct-answer');
    gameState.score++;
    document.getElementById('score-display').textContent = `Streak: ${gameState.score}`;
    animateFallingWords(scene, gameState.currentWord);
    loadNewWord(scene);
  } else {
    const response = getIntensityBasedResponse(gameState.score, false);
    gameState.score = 0;
    document.getElementById('score-display').textContent = `Streak: ${gameState.score}`;
    resultElement.textContent = response;
    resultElement.style.color = '#FFFFFF';
    resultElement.classList.remove('correct-answer');

    isAnimating = true;
    const originalX = scene.wordText.x;
    
    scene.tweens.add({
      targets: scene.wordText,
      x: '+=20',
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        scene.wordText.x = originalX; // Ensure word returns to original position
        isAnimating = false;
      }
    });
  }

  document.getElementById('user-input').value = '';
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%'
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  const backgroundUrl = document.getElementById('game-container').getAttribute('data-background-url');
  this.load.image('background', backgroundUrl);
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 2500); // Wait for longer fade animation
  }
}

function create() {
  const background = this.add.image(config.width / 2, config.height / 2, 'background');
  background.setOrigin(0.5, 0.5);
  background.setDisplaySize(config.width, config.height);

  // Create UI container
  const uiContainer = this.add.container(0, 0);
  
  // Add word text in upper area
  this.wordText = this.add.text(config.width / 2, config.height * 0.25, 'Loading...', {
    font: '75px Special Elite',
    fill: getRandomWordColor(),
    stroke: '#001f04',
    strokeThickness: 6,
    shadow: {
      offsetX: 12,
      offsetY: 12,
      color: getRandomWordColor(),
      blur: 10,
      opacity: 0.7
    }
  }).setOrigin(0.5);

  // Initialize game elements
  const resultElement = document.getElementById('result');
  const inputField = document.getElementById('user-input');

  // Position virtual keyboard at bottom for mobile
  const keyboard = document.getElementById('virtual-keyboard');
  if (keyboard && window.innerWidth <= 768) {
    keyboard.style.position = 'fixed';
    keyboard.style.bottom = '0';
    keyboard.style.left = '0';
    keyboard.style.width = '100%';
    keyboard.style.background = 'rgba(0, 0, 0, 0)';
    keyboard.style.padding = '10px 0';
    keyboard.style.display = 'block';
    keyboard.style.zIndex = '1000';
  }


  loadNewWord(this);

  // Handle window resize
  this.scale.on('resize', (gameSize) => {
    // Update background size
    background.setDisplaySize(gameSize.width, gameSize.height);
    background.setPosition(gameSize.width / 2, gameSize.height / 2);
    
    // Update word text position
    this.wordText.setPosition(gameSize.width / 2, gameSize.height * 0.25);
  });

  // Handle keyboard display
  window.addEventListener('resize', () => {
    const keyboard = document.getElementById('virtual-keyboard');
    if (keyboard) {
      if (window.innerWidth <= 768) {
        keyboard.style.display = 'block';
      } else {
        keyboard.style.display = 'none';
      }
    }
  });
}

function update() {}

document.addEventListener('DOMContentLoaded', async function() {
  setupKeyboard();
  setupDefinitionToggle();
  game = new Phaser.Game(config);
  
  // Wait a bit to ensure all assets are loaded
  setTimeout(hideLoadingScreen, 1500);
});

// Setup definition toggle functionality
function setupDefinitionToggle() {
  const toggleBtn = document.querySelector('.definition-toggle');
  const definitionHeader = document.querySelector('.definition-header');
  const definitionElement = document.getElementById('word-definition');
  const definitionLabel = document.querySelector('.definition-label');
  let isCollapsed = true; // Start collapsed by default
  
  // Set initial state
  definitionElement.style.display = 'none';
  toggleBtn.textContent = '↓';
  
  // Store the current word and definition
  let currentWord = '';
  let currentDefinition = '';
  
// Make both the button and the whole header clickable
  function toggleDefinition(e) {
    // Prevent event bubbling
    if (e) e.stopPropagation();
    
    isCollapsed = !isCollapsed;
    
    if (isCollapsed) {
      definitionElement.style.display = 'none';
      toggleBtn.textContent = '↓';
    } else {
      definitionElement.style.display = 'block';
      toggleBtn.textContent = '↑';
      
      // If we have a current word and definition, update the definition element
      if (currentWord && currentDefinition) {
        definitionElement.textContent = `${currentWord}: ${currentDefinition}`;
      }
    }
  }
  
  // Add click event to both the button and the header
  toggleBtn.addEventListener('click', toggleDefinition);
  definitionHeader.addEventListener('click', toggleDefinition);
  
  // Add a method to update the current word and definition
  window.updateDefinition = function(word, definition) {
    currentWord = word;
    currentDefinition = definition;
    
    // If the definition is visible, update it
    if (!isCollapsed) {
      definitionElement.style.opacity = '0'; // Fade out
      setTimeout(() => {
        definitionElement.textContent = `${word}: ${definition}`;
        definitionElement.style.opacity = '1'; // Fade in
      }, 300);
    }
  };
}

window.addEventListener('beforeunload', () => {
  gameState = {};
});
