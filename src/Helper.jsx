const createKey = (row, col) => `${row}-${col}`;

export const PLAYER_META = [
  {
    id: 0,
    name: "Red",
    colorClass: "player-red",
    accent: "#e34b4b",
    startIndex: 0,
    basePositions: [
      { row: 3, col: 3 },
      { row: 3, col: 5 },
      { row: 5, col: 3 },
      { row: 5, col: 5 },
    ],
    homeLane: [
      { row: 8, col: 2 },
      { row: 8, col: 3 },
      { row: 8, col: 4 },
      { row: 8, col: 5 },
      { row: 8, col: 6 },
    ],
  },
  {
    id: 1,
    name: "Green",
    colorClass: "player-green",
    accent: "#29a36a",
    startIndex: 13,
    basePositions: [
      { row: 3, col: 11 },
      { row: 3, col: 13 },
      { row: 5, col: 11 },
      { row: 5, col: 13 },
    ],
    homeLane: [
      { row: 2, col: 8 },
      { row: 3, col: 8 },
      { row: 4, col: 8 },
      { row: 5, col: 8 },
      { row: 6, col: 8 },
    ],
  },
  {
    id: 2,
    name: "Yellow",
    colorClass: "player-yellow",
    accent: "#d4a514",
    startIndex: 26,
    basePositions: [
      { row: 11, col: 11 },
      { row: 11, col: 13 },
      { row: 13, col: 11 },
      { row: 13, col: 13 },
    ],
    homeLane: [
      { row: 8, col: 14 },
      { row: 8, col: 13 },
      { row: 8, col: 12 },
      { row: 8, col: 11 },
      { row: 8, col: 10 },
    ],
  },
  {
    id: 3,
    name: "Blue",
    colorClass: "player-blue",
    accent: "#3b6ee6",
    startIndex: 39,
    basePositions: [
      { row: 11, col: 3 },
      { row: 11, col: 5 },
      { row: 13, col: 3 },
      { row: 13, col: 5 },
    ],
    homeLane: [
      { row: 14, col: 8 },
      { row: 13, col: 8 },
      { row: 12, col: 8 },
      { row: 11, col: 8 },
      { row: 10, col: 8 },
    ],
  },
];

export const ringPath = [
  { row: 7, col: 2 },
  { row: 7, col: 3 },
  { row: 7, col: 4 },
  { row: 7, col: 5 },
  { row: 7, col: 6 },
  { row: 6, col: 7 },
  { row: 5, col: 7 },
  { row: 4, col: 7 },
  { row: 3, col: 7 },
  { row: 2, col: 7 },
  { row: 1, col: 7 },
  { row: 1, col: 8 },
  { row: 1, col: 9 },
  { row: 2, col: 9 },
  { row: 3, col: 9 },
  { row: 4, col: 9 },
  { row: 5, col: 9 },
  { row: 6, col: 9 },
  { row: 7, col: 10 },
  { row: 7, col: 11 },
  { row: 7, col: 12 },
  { row: 7, col: 13 },
  { row: 7, col: 14 },
  { row: 7, col: 15 },
  { row: 8, col: 15 },
  { row: 9, col: 15 },
  { row: 9, col: 14 },
  { row: 9, col: 13 },
  { row: 9, col: 12 },
  { row: 9, col: 11 },
  { row: 9, col: 10 },
  { row: 10, col: 9 },
  { row: 11, col: 9 },
  { row: 12, col: 9 },
  { row: 13, col: 9 },
  { row: 14, col: 9 },
  { row: 15, col: 9 },
  { row: 15, col: 8 },
  { row: 15, col: 7 },
  { row: 14, col: 7 },
  { row: 13, col: 7 },
  { row: 12, col: 7 },
  { row: 11, col: 7 },
  { row: 10, col: 7 },
  { row: 9, col: 6 },
  { row: 9, col: 5 },
  { row: 9, col: 4 },
  { row: 9, col: 3 },
  { row: 9, col: 2 },
  { row: 9, col: 1 },
  { row: 8, col: 1 },
  { row: 8, col: 2 },
];

export const SAFE_PROGRESS = [0, 8, 13, 21, 26, 34, 39, 47];
export const FINAL_PROGRESS = 57;

export const getRingCoordinate = (playerIndex, progress) =>
  ringPath[(PLAYER_META[playerIndex].startIndex + progress) % ringPath.length];

export const getTokenCoordinate = (playerIndex, tokenIndex, progress) => {
  if (progress === -1) {
    return PLAYER_META[playerIndex].basePositions[tokenIndex];
  }

  if (progress <= 51) {
    return getRingCoordinate(playerIndex, progress);
  }

  if (progress <= 56) {
    return PLAYER_META[playerIndex].homeLane[progress - 52];
  }

  return { row: 8, col: 8 };
};

export const getCellKey = (row, col) => createKey(row, col);

const ringKeySet = new Set(ringPath.map(({ row, col }) => createKey(row, col)));
const homeLaneKeySet = new Set(
  PLAYER_META.flatMap((player) =>
    player.homeLane.map(({ row, col }) => createKey(row, col)),
  ),
);
const centerKeySet = new Set([
  createKey(7, 7),
  createKey(7, 8),
  createKey(7, 9),
  createKey(8, 7),
  createKey(8, 8),
  createKey(8, 9),
  createKey(9, 7),
  createKey(9, 8),
  createKey(9, 9),
]);

const redHomeKeys = new Set(
  PLAYER_META[0].homeLane.map(({ row, col }) => createKey(row, col)),
);
const greenHomeKeys = new Set(
  PLAYER_META[1].homeLane.map(({ row, col }) => createKey(row, col)),
);
const yellowHomeKeys = new Set(
  PLAYER_META[2].homeLane.map(({ row, col }) => createKey(row, col)),
);
const blueHomeKeys = new Set(
  PLAYER_META[3].homeLane.map(({ row, col }) => createKey(row, col)),
);
const safeCellKeys = new Set(
  SAFE_PROGRESS.map((progress) => {
    const { row, col } = ringPath[progress];
    return createKey(row, col);
  }),
);

export const boardSquares = [];
for (let row = 1; row <= 15; row += 1) {
  for (let col = 1; col <= 15; col += 1) {
    const key = createKey(row, col);
    if (ringKeySet.has(key) || homeLaneKeySet.has(key) || centerKeySet.has(key)) {
      boardSquares.push({ row, col, key });
    }
  }
}

export const getSquareColorClass = (row, col) => {
  const key = createKey(row, col);

  if (redHomeKeys.has(key)) return "red-home";
  if (greenHomeKeys.has(key)) return "green-home";
  if (yellowHomeKeys.has(key)) return "yellow-home";
  if (blueHomeKeys.has(key)) return "blue-home";
  if (centerKeySet.has(key)) return "center-square";
  if (safeCellKeys.has(key)) return "safe-square";
  return "track-square";
};

export const getMovableTokenIndexes = (playerIndex, playerTokens, diceRoll) =>
  playerTokens.reduce((indexes, progress, tokenIndex) => {
    if (diceRoll === null) {
      return indexes;
    }

    if (progress === -1 && diceRoll === 6) {
      indexes.push(tokenIndex);
      return indexes;
    }

    if (progress >= 0 && progress + diceRoll <= FINAL_PROGRESS) {
      indexes.push(tokenIndex);
    }

    return indexes;
  }, []);

export const isSafeProgress = (progress) => SAFE_PROGRESS.includes(progress);
