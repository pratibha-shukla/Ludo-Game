const safeZones = [0, 8, 13, 21, 26, 34, 39, 47]; // Indices of star/safe zones
const redHomePathIndices = [52, 53, 54, 55, 56]; // Example indices for home stretch
const greenHomePathIndices = [/* ... */]; // Define indices for green home stretch
// ... define yellowHomePathIndices and blueHomePathIndices similarly

// Helper function to get color class based on coordinates (row, col)
export const getSquareColorClass = (row, col) => {
    // Check start zones
    if (row === 7 && col === 2) return 'red-start-zone';
    if (row === 2 && col === 9) return 'green-start-zone';
    if (row === 9 && col === 14) return 'yellow-start-zone';
    if (row === 14 && col === 7) return 'blue-start-zone';

    if (row === 7 && col === 7) return "red-start-zone"
    if (row === 8 && col === 7) return "red-start-zone"
    if (row === 9 && col === 7) return "red-start-zone"
    if (row === 7 && col === 8) return "red-start-zone"
    if (row === 8 && col === 8) return "red-start-zone"
    if (row === 9 && col === 9) return "red-start-zone"
    if (row === 9 && col === 8) return "red-start-zone"
    if (row === 8 && col === 9) return "red-start-zone"
    if (row === 8 && col === 6) return "red-start-zone"

    if (row === 8 && col === 5) return "red-start-zone"
    if (row === 8 && col === 4) return "red-start-zone"
    if (row === 8 && col === 3) return "red-start-zone"
    if (row === 8 && col === 2) return "red-start-zone"
    if (row === 7 && col === 9) return "red-start-zone"

    if (row === 8 && col === 10) return "yellow-start-zone"
    if (row === 8 && col === 11) return "yellow-start-zone"
    if (row === 8 && col === 12) return "yellow-start-zone"
    if (row === 8 && col === 13) return "yellow-start-zone"
    if (row === 8 && col === 14) return "yellow-start-zone"

    if (row === 6 && col === 8) return "green-start-zone"
    if (row === 5 && col === 8) return "green-start-zone"
    if (row === 4 && col === 8) return "green-start-zone"
    if (row === 3 && col === 8) return "green-start-zone"
    if (row === 2 && col === 8) return "green-start-zone"

     if (row === 10 && col === 8) return 'blue-start-zone';
      if (row === 11 && col === 8) return 'blue-start-zone';
       if (row === 12 && col === 8) return 'blue-start-zone';
        if (row === 13 && col === 8) return 'blue-start-zone';
         if (row === 14 && col === 8) return 'blue-start-zone';

       
      




    // You can add more complex checks here for safe zones if needed, 
    // but the above covers the main colored start blocks.

    return ''; // Default to no extra class
};

export const boardPathMap = [
    // Red Path (starts at 0)
    { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 },
    { row: 6, col: 6 }, { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 },
    { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 },
    // Green Path (continues at 13)
    { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 8 },
    { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
    { row: 6, col: 14 }, { row: 7, col: 15 }, { row: 8, col: 15 },
    // Yellow Path (continues at 26)
    { row: 8, col: 14 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 },
    { row: 9, col: 10 }, { row: 10, col: 10 }, { row: 11, col: 10 }, { row: 12, col: 10 }, { row: 13, col: 10 },
    { row: 14, col: 10 }, { row: 15, col: 9 }, { row: 15, col: 8 },
    // Blue Path (continues at 39)
    { row: 14, col: 8 }, { row: 13, col: 8 }, { row: 12, col: 8 }, { row: 11, col: 8 }, { row: 10, col: 8 },
    { row: 9, col: 8 }, { row: 9, col: 7 }, { row: 9, col: 6 }, { row: 9, col: 5 }, { row: 9, col: 4 },
    { row: 9, col: 3 }, { row: 9, col: 2 }, { row: 8, col: 1 },
];

export const basePositions = [
    // Red Base
    [{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 }],
    // Green Base
    [{ row: 3, col: 12 }, { row: 3, col: 13 }, { row: 4, col: 12 }, { row: 4, col: 13 }],
    // Yellow Base
    [{ row: 12, col: 12 }, { row: 12, col: 13 }, { row: 13, col: 12 }, { row: 13, col: 13 }],
    // Blue Base
    [{ row: 12, col: 3 }, { row: 12, col: 4 }, { row: 13, col: 3 }, { row: 13, col: 4 }],
];

// Generate all individual board squares for rendering the path
export const boardSquares = [];
for (let row = 1; row <= 15; row++) {
    for (let col = 1; col <= 15; col++) {
        const inBase = (row <= 6 && col <= 6) || (row <= 6 && col >= 10) ||
            (row >= 10 && col <= 6) || (row >= 10 && col >= 10);
        if (!inBase) {
            boardSquares.push({ row, col });
        }
    }
}
