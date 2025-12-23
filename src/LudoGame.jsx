import React, { useState } from 'react';
import "./LudoGame.css";
import {getSquareColorClass,boardPathMap,basePositions,boardSquares} from "./Helper.jsx";



const LudoGame = () => {
  // --- State Hooks ---
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceRoll, setDiceRoll] = useState(1);
  const [positions, setPositions] = useState([
    [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]
  ]);

  // --- Game Logic Functions ---
  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    if (roll !== 6) setCurrentPlayer((prev) => (prev + 1) % 4);
  };

  const moveToken = (playerIndex, tokenIndex) => {
    if (playerIndex !== currentPlayer) return;

    let newPositions = [...positions];
    let currentPos = newPositions[playerIndex][tokenIndex];
      let moved = false; // Track if a move actually happened

    if (currentPos === -1 && diceRoll === 6) {
      newPositions[playerIndex][tokenIndex] = 0; // Needs player start logic
        moved = true;

    } else if (currentPos >= 0) {
      newPositions[playerIndex][tokenIndex] += diceRoll;
        moved = true;
    }
    if (moved) {
    setPositions(newPositions);
    
    // CRITICAL FIX: Only switch players IF the dice roll was NOT a 6
    if (diceRoll !== 6) {
      setCurrentPlayer((prev) => (prev + 1) % 4);
    }
    // If it was a 6, the currentPlayer state remains the same,
    // and they get to roll/move again.
  }
};

  // Helper function to get the CSS grid coordinates for a token
  const getPositionStyles = (playerIndex, tokenIndex, pos) => {
    if (pos === -1) {
      const basePos = basePositions[playerIndex][tokenIndex];
      return { gridRowStart: basePos.row, gridColumnStart: basePos.col };
    }
    const mapEntry = boardPathMap[pos];
    if (mapEntry) {
      return { gridRowStart: mapEntry.row, gridColumnStart: mapEntry.col };
    }
    return { gridRowStart: 8, gridColumnStart: 8 }; // Placeholder
  };

  return (
    <div style={{ textAlign: 'center'}}>
      <h2>Player {currentPlayer + 1}'s Turn</h2>
      <button onClick={rollDice}>Roll Dice: {diceRoll}</button>
      
      {/* Main Board Container (only one instance) */}
      <div className="ludo-container">
        {/* Render all static white/colored squares of the track */}
        {boardSquares.map((square, index) => (
          <div
            key={`square-${index}`}
          className={`board-square ${getSquareColorClass(square.row, square.col)}`}
            style={{ gridRowStart: square.row, gridColumnStart: square.col }}
          />
        ))}

         {/* Render the static colored base areas */}
         <div className="base red-base"></div>
         <div className="base green-base"></div>
         <div className="base blue-base"></div>
         <div className="base yellow-base"></div>

        {/* Render the dynamic tokens */}
        {positions.map((playerTokens, pIdx) => (
          playerTokens.map((pos, tIdx) => (
              <div
                key={`${pIdx}-${tIdx}`}
                style={getPositionStyles(pIdx, tIdx, pos)}
                className={`token player-${pIdx + 1}`}
                onClick={() => moveToken(pIdx, tIdx)}
              >
                P{pIdx + 1} T{tIdx + 1}
              </div>
            ))
        ))}
      </div>
    </div>
  );
};

export default LudoGame;
