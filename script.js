// Game configuration
const MAP_SIZE = 20;
const CELL_SIZE = 25; // in pixels
const MOVE_SPEED = 100; // milliseconds for movement animation

// Asset definitions for consistent data
const assetDefinitions = {
  wall: [
    { type: 'wall-0', collision: true }, // Liquid Wall - assumed solid for collision
    { type: 'wall-1', collision: true }, // Solid Wall
    { type: 'wall-2', collision: false }, // Semi-solid Wall - assumed walkable
  ],
  floor: [
    { type: 'floor-0', collision: false }, // Water Floor
    { type: 'floor-1', collision: false }, // Stone Floor
    { type: 'floor-2', collision: false }, // Weakened Stone Floor
    { type: 'floor-3', collision: false }, // Wooden Floor
    { type: 'floor-4', collision: false }, // Weakened Wooden Floor
  ],
};

// Map state using a 2D array for efficient lookup
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

/**
 * Initializes the game grid and character.
 */
function init() {
  createGrid();
  createCharacter();
  setupEventListeners();
  updateCharacterPosition();
}

/**
 * Creates the game grid and initializes the map.
 */
function createGrid() {
  gridContainer.style.gridTemplateColumns = `repeat(${MAP_SIZE}, ${CELL_SIZE}px)`;
  gridContainer.style.width = `${MAP_SIZE * CELL_SIZE}px`;
  gridContainer.style.height = `${MAP_SIZE * CELL_SIZE}px`;

  // Initialize grid with default cells (e.g., solid walls around the edge)
  grid = Array(MAP_SIZE).fill(null).map(() => Array(MAP_SIZE).fill(null));
  gridContainer.innerHTML = '';

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      let cellData;
      if (x === 0 || x === MAP_SIZE - 1 || y === 0 || y === MAP_SIZE - 1) {
        //: Use the correct index for a solid wall, e.g., index 1
        cellData = assetDefinitions.wall[1]; 
      } else {
        //: Use the correct index for a floor, e.g., index 1 for stone floor
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


/**
 * Creates the character sprite and positions it.
 */
function createCharacter() {
  characterElement = document.createElement('div');
  characterElement.classList.add('character');
  gridContainer.appendChild(characterElement);

  // Set initial character position
  character.posX = Math.floor(MAP_SIZE / 2);
  character.posY = Math.floor(MAP_SIZE / 2);
}

/**
 * Updates the character's visual position.
 */
function updateCharacterPosition() {
  const { posX, posY } = character;
  characterElement.style.transform = `translate(${posX * CELL_SIZE}px, ${posY * CELL_SIZE}px)`;
  charStats.textContent = `(${posX}, ${posY})`;
}

/**
 * Handles character movement.
 * @param {number} dx - The change in x-coordinate.
 * @param {number} dy - The change in y-coordinate.
 */
function move(dx, dy) {
  if (character.isMoving) return;

  const nextX = character.posX + dx;
  const nextY = character.posY + dy;

  // Check if the target cell is valid and not a collision
  if (isWalkable(nextX, nextY)) {
    character.isMoving = true;
    character.posX = nextX;
    character.posY = nextY;
    updateCharacterPosition();

    // Use setTimeout for a single step, not setInterval
    setTimeout(() => {
      character.isMoving = false;
    }, MOVE_SPEED);
  }
}

/**
 * Checks if a cell is walkable based on grid data.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 * @returns {boolean} - True if the cell is walkable, false otherwise.
 */
function isWalkable(x, y) {
  // Check for out-of-bounds
  if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE) {
    return false;
  }
  const cellData = grid[y][x];
  return cellData && !cellData.collision;
}

/**
 * Updates a cell's type and re-renders the map.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 * @param {string} newType - The new type (e.g., 'wall', 'floor').
 * @param {number} newIndex - The index within the asset type.
 */
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

/**
 * Renders a single cell based on the grid data.
 * @param {number} x - The x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the cell.
 */
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

/**
 * Sets up all event listeners.
 */
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

  // Toggle movement buttons visibility
  function toggleMovementBtn(){
    movementControls.classList.toggle('hidden');
  };
}

// Start the game when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
