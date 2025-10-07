// --- Core Game Logic ---

// A central object to hold all asset definitions
const assetDefinitions = {
  wall: [
    { property: 'liquid', collision: true },
    { property: 'solid', collision: true },
    { property: 'semi-solid', collision: true },
  ],
  floor: [
    { property: 'liquid', collision: true, name: 'water' },
    { property: 'solid', collision: true, name: 'stone_floor' },
    { property: 'semi-solid', collision: true, name: 'weakened_stone_floor' },
    { property: 'solid', collision: true, name: 'wooden_floor' },
    { property: 'semi-solid', collision: true, name: 'weakened_wooden_floor' },
  ]
};

// Master map of all cells
const cellMap = [
  // Row 0
  { x: 0, y: 0, cellType: null, cellTypeIndex: null }, // Start cell
  { x: 1, y: 0, cellType: 'wall', cellTypeIndex: 1 }, // "solid" wall cell
  { x: 2, y: 0, cellType: null, cellTypeIndex: null }, // non-wall cell
  { x: 3, y: 0, cellType: null, cellTypeIndex: null }, // empty cell
  
  // Row 1
  { x: 0, y: 1, cellType: 'wall', cellTypeIndex: 0 }, // "liquid" wall cell
  { x: 1, y: 1, cellType: 'floor', cellTypeIndex: 1 }, // "stone_floor" cell
  { x: 2, y: 1, cellType: 'wall', cellTypeIndex: 2 }, // "semi-solid" wall cell
  { x: 3, y: 1, cellType: null, cellTypeIndex: null }, // empty cell
];

// State and character data
var isMoving = false;
var moveSpeed = 100;
var movementInt;
var character = {
  posX: 0,
  posY: 0,
  facing: 'right'
};

/**
 * Finds and returns a cell object from the cellMap by its coordinates.
 * @param {number} x The x-coordinate of the cell.
 * @param {number} y The y-coordinate of the cell.
 * @returns {object} The found cell object or an out-of-bounds representation.
 */
function findCell(x, y) {
  const foundCell = cellMap.find(cell => cell.x === x && cell.y === y);
  if (!foundCell) {
    // Return a default object for out-of-bounds areas, treating them as solid walls
    return { x, y, cellType: 'wall', cellTypeIndex: 1, isOutOfBounds: true };
  }
  return foundCell;
}

/**
 * Checks the cell that the character is facing and returns its data.
 * @param {number} facingX The x-coordinate to check.
 * @param {number} facingY The y-coordinate to check.
 * @returns {object} The complete asset data for the target cell.
 */
function getTargetCellData(facingX, facingY) {
  const targetCell = findCell(facingX, facingY);
  if (targetCell.isOutOfBounds) {
    console.log('Out of bounds!');
    // Correctly return the solid wall asset
    return assetDefinitions.wall[1]; 
  }

  if (targetCell.cellType) {
    return assetDefinitions[targetCell.cellType][targetCell.cellTypeIndex];
  }
  
  return null; // Empty cell
}

/**
 * Moves the character based on the specified direction.
 * @param {string} direction The direction to move ('up', 'down', 'left', 'right').
 */
function move(direction) {
  if (isMoving) {
    return;
  }
  
  isMoving = true;
  let nextX = character.posX;
  let nextY = character.posY;
  
  switch (direction) {
    case 'up': nextY--; break;
    case 'down': nextY++; break;
    case 'left': nextX--; break;
    case 'right': nextX++; break;
  }
  
  const cellData = getTargetCellData(nextX, nextY);

  if (cellData && cellData.property === 'solid') {
    console.log(`Collision detected with a solid object (${cellData.name || 'wall'})! Movement blocked.`);
    isMoving = false;
  } else if (cellData && cellData.property === 'semi-solid') {
    console.log(`Interaction detected with a semi-solid object (${cellData.name || 'wall'}). Movement stopped.`);
    isMoving = false;
  } else {
    console.log(`Moving ${direction} from (${character.posX}, ${character.posY}) to (${nextX}, ${nextY})`);
    
    movementInt = setInterval(() => {
      character.posX = nextX;
      character.posY = nextY;
      
      // Update the visual position of the character
      updateCharacterPosition();
      
      clearInterval(movementInt);
      isMoving = false;
      console.log(`Character is now at (${character.posX}, ${character.posY})`);
    }, moveSpeed);
  }
}

// --- DOM Manipulation and Game Initialization ---

const gridContainer = document.getElementById('grid-container');
const charStats = document.getElementById('char-pos');
let characterElement; // Variable to hold the character's DOM element

// Function to generate the visual map based on cellMap data
function generateMap() {
  const mapRows = Math.max(...cellMap.map(cell => cell.y)) + 1;
  const mapCols = Math.max(...cellMap.map(cell => cell.x)) + 1;

  gridContainer.style.gridTemplateColumns = `repeat(${mapCols}, 50px)`;
  gridContainer.style.gridTemplateRows = `repeat(${mapRows}, 50px)`;

  for (let y = 0; y < mapRows; y++) {
    for (let x = 0; x < mapCols; x++) {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      cellElement.dataset.x = x;
      cellElement.dataset.y = y;

      const cellData = findCell(x, y);
      if (cellData.cellType) {
        cellElement.classList.add(`${cellData.cellType}-${cellData.cellTypeIndex}`);
      }

      gridContainer.appendChild(cellElement);
    }
  }

  // Create and place the character on the map
  characterElement = document.createElement('div');
  characterElement.classList.add('character');
  gridContainer.appendChild(characterElement);

  updateCharacterPosition();
}

// Function to update the character's visual position
function updateCharacterPosition() {
  characterElement.style.transform = `translate(${character.posX * 100}%, ${character.posY * 100}%)`;
  charStats.textContent = `(${character.posX}, ${character.posY})`;
}

// Event listeners for movement buttons
document.getElementById('up-btn').addEventListener('click', () => move('up'));
document.getElementById('down-btn').addEventListener('click', () => move('down'));
document.getElementById('left-btn').addEventListener('click', () => move('left'));
document.getElementById('right-btn').addEventListener('click', () => move('right'));

// Add keyboard controls
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      move('up');
      break;
    case 'ArrowDown':
    case 's':
      move('down');
      break;
    case 'ArrowLeft':
    case 'a':
      move('left');
      break;
    case 'ArrowRight':
    case 'd':
      move('right');
      break;
  }
});

// Initial map generation when the script loads
generateMap();
