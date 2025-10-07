// Game config
var MAP_SIZE = 20;
var CELL_SIZE = 25; // (px)
var MOVE_SPEED = 100; // movement animation (ms)

// Asset definitions
const assetDefinitions = {
  wall: [
    { type: 'wall-0', collision: true }, // Liquid Wall - assumed solid for collision
    { type: 'wall-1', collision: true }, // Solid Wall
    { type: 'wall-2', collision: false }, // Semi-solid Wall - assumed walkable
  ],
  floor: [ // all assumed walkable
    { type: 'floor-0', collision: false }, // Water Floor
    { type: 'floor-1', collision: false }, // Stone Floor
    { type: 'floor-2', collision: false }, // Weakened Stone Floor
    { type: 'floor-3', collision: false }, // Wooden Floor
    { type: 'floor-4', collision: false }, // Weakened Wooden Floor
  ],
};

// Map state using 2D array
let grid;

// Character state
const character = {
  posX: 0,
  posY: 0,
  isMoving: false,
};

// DOM elements
const gridContainer = document.getElementById('grid-container');
const charStats = document.getElementById('char-pos');
const devConsoleToggle = document.getElementById('dev-console-toggle');
const devConsoleDropdown = document.getElementById('dev-console-dropdown');
const applyChangesBtn = document.getElementById('apply-changes-btn');
const movementControls = document.querySelector('.movement-controls');
const coordXInput = document.getElementById('coord-x');
const coordYInput = document.getElementById('coord-y');
const objectTypeSelect = document.getElementById('object-type');
let characterElement;


// Create game grid & initialize map
function createGrid() {
  gridContainer.style.gridTemplateColumns = `repeat(${MAP_SIZE}, ${CELL_SIZE}px)`;
  gridContainer.style.width = `${MAP_SIZE * CELL_SIZE}px`;
  gridContainer.style.height = `${MAP_SIZE * CELL_SIZE}px`;

  // Initialize grid with default cells
  grid = Array(MAP_SIZE).fill(null).map(() => Array(MAP_SIZE).fill(null));
  gridContainer.innerHTML = '';

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      let cellData;
      if (x === 0 || x === MAP_SIZE - 1 || y === 0 || y === MAP_SIZE - 1) {
        // Use the index for solid wall
        cellData = assetDefinitions.wall[1]; 
      } else {
        // Use correct index for floor
        cellData = assetDefinitions.floor[1]; 
      }
      grid[y][x] = cellData;
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell', cellData.type);
      cellElement.dataset.x = x;
      cellElement.dataset.y = y;
      gridContainer.appendChild(cellElement);
    }
  }
}



// Create character sprite & position it
function createCharacter() {
  characterElement = document.createElement('div');
  characterElement.classList.add('character');
  gridContainer.appendChild(characterElement);

  // Set initial character position
  character.posX = Math.floor(MAP_SIZE / 2);
  character.posY = Math.floor(MAP_SIZE / 2);
}


// Updates the character's visual position.
function updateCharacterPosition() {
  const { posX, posY } = character;
  characterElement.style.transform = `translate(${posX * CELL_SIZE}px, ${posY * CELL_SIZE}px)`;
  charStats.textContent = `(${posX}, ${posY})`;
}


// Handle character movement
// @param {number} dx: change in x-coordinate | @param {number} dy: change in y-coordinate
function move(dx, dy) {
  if (character.isMoving) return;

  const nextX = character.posX + dx;
  const nextY = character.posY + dy;

  // Check if target cell is valid & not collision
  if (isWalkable(nextX, nextY)) {
    character.isMoving = true;
    character.posX = nextX;
    character.posY = nextY;
    updateCharacterPosition();

    // Use setTimeout for single step
    setTimeout(() => {
      character.isMoving = false;
    }, MOVE_SPEED);
  }
}

// Checks if cell is walkable based on grid data
// @param {number} x: x-coordinate of the cell | param {number} y: y-coordinate of cell
function isWalkable(x, y) {
  // Check for out-of-bounds
  if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
    return false;
  }
  const cellData = grid[y][x];
  return cellData && !cellData.collision;
}


// Update cell type & re-render map.
// @param {number} x: x-coordinate of cell | param {number} y: y-coordinate of cell
// @param {string} newType: new type | param {number} newIndex: index within asset type
function updateCell(x, y, newType, newIndex) {
  if (x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE) {
    let newCellData;
    if (newType === null) {
      newCellData = null;
    } else {
      newCellData = assetDefinitions[newType][newIndex];
    }
    grid[y][x] = newCellData;
    renderCell(x, y);
  } else {
    console.error("Coordinates are out of bounds.");
  }
}

// Render single cell based on grid data.
// @param {number} x: x-coordinate of cell | @param {number} y: y-coordinate of cell
function renderCell(x, y) {
  const cellElement = gridContainer.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (cellElement) {
    // Clear all existing asset classes
    cellElement.className = 'cell';
    const cellData = grid[y][x];
    if (cellData) {
      cellElement.classList.add(cellData.type);
    }
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Movement buttons
  document.getElementById('up-btn').addEventListener('click', () => move(0, -1));
  document.getElementById('down-btn').addEventListener('click', () => move(0, 1));
  document.getElementById('left-btn').addEventListener('click', () => move(-1, 0));
  document.getElementById('right-btn').addEventListener('click', () => move(1, 0));

  // Keyboard controls
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        move(0, -1);
        break;
      case 'ArrowDown':
      case 's':
        move(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
        move(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
        move(1, 0);
        break;
    }
  });

  // Dev Console toggle
  devConsoleToggle.addEventListener('click', () => {
    devConsoleDropdown.classList.toggle('show');
  });

  // Apply changes from dev console
  applyChangesBtn.addEventListener('click', () => {
    const x = parseInt(coordXInput.value);
    const y = parseInt(coordYInput.value);
    const typeValue = objectTypeSelect.value;

    let newType = null;
    let newIndex = null;

    if (typeValue !== 'none') {
      const [type, index] = typeValue.split('-');
      newType = type;
      newIndex = parseInt(index);
    }

    if (!isNaN(x) && !isNaN(y)) {
      updateCell(x, y, newType, newIndex);
    } else {
      console.error("Invalid coordinates.");
    }
  });

  // Toggle movement buttons visibility | intended for use only in JavaScript console
  function toggleMovementBtn(){
    movementControls.classList.toggle('hidden');
  };
}

// message for JavaScript console
const message = `welcome to the console
console-only commands:
toggleMovementBtn() | no parameters, call this function to toggle the visibility of the movement buttons (hidden by default)
createGrid() | no parameters, call this function to create/re-render the grid
renderCell(x, y) | two parameters, call this function with its parameters to render a cell
updateCell(x, y, newType, newIndex) | four parameters, call this function with its parameters to update a cell
move(dx, dy) | two parameters, call this function with its parameters to move the character

initial game config: (edit at your own risk, or enjoyment)
MAP_SIZE = 20; | cells (#)
CELL_SIZE = 25; | size (px)
MOVE_SPEED = 100; | movement animation (ms)

extras: (uneditable)
type "help" to display this message again
type "assetsInfo" to display game asset information and character information (stored in arrays)
type "controls" to display the game controls
type "credits" to display the credits
`;

// assetsInfoMessage for JavaScript console
const assetsInfoMessage = `assets info:
const assetDefinitions = {
  wall: [
    { type: 'wall-0', collision: true }, // Liquid Wall - assumed solid for collision
    { type: 'wall-1', collision: true }, // Solid Wall
    { type: 'wall-2', collision: false }, // Semi-solid Wall - assumed walkable
  ],
  floor: [ // all assumed walkable
    { type: 'floor-0', collision: false }, // Water Floor
    { type: 'floor-1', collision: false }, // Stone Floor
    { type: 'floor-2', collision: false }, // Weakened Stone Floor
    { type: 'floor-3', collision: false }, // Wooden Floor
    { type: 'floor-4', collision: false }, // Weakened Wooden Floor
  ],
};

initial character state:
const character = {
  posX: 0,
  posY: 0,
  isMoving: false,
};

current character state:
const character = {
  posX: ${character.posX},
  posY: ${character.posY},
  isMoving: ${character.isMoving},
};
`;

// controlsMessage for JavaScript console
const controlsMessage = `constrols:
w-a-s-d | arrow keys
`;

// creditsMessage for JavaScript console
const creditsMessage = `
Author: "absurd-oliver" & "absurdo-liver"
github repository: "game-maybe-"
links: 
  website link: https://absurdo-liver.github.io/game-maybe-/
  github repository link: https://github.com/absurdo-liver/game-maybe-
  author github profiles links: https://github.com/absurd-oliver/ & https://github.com/absurdo-liver/
`;

// help command in JavaScript console
function help(){
  console.log(message);
}

// assetsInfo command in JavaScript console
function assetsInfo(){
  console.log(assetsInfoMessage);
}

// controls command in JavaScript console
function controls(){
  console.log(controlsMessage);
}

// credits command in JavaScript console
function credits(){
  console.log(creditsMessage);
}

// Initialize game grid & character
function init() {
  createGrid();
  createCharacter();
  setupEventListeners();
  updateCharacterPosition();

  // message logged to JavaScript console for those who visit it
  console.log(message);
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', init);
