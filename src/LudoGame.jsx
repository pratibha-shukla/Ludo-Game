import { useMemo, useState } from "react";
import "./LudoGame.css";
import {
  FINAL_PROGRESS,
  PLAYER_META,
  boardSquares,
  getCellKey,
  getMovableTokenIndexes,
  getSquareColorClass,
  getTokenCoordinate,
  isSafeProgress,
} from "./Helper.jsx";

const createInitialPositions = () =>
  Array.from({ length: 4 }, () => [-1, -1, -1, -1]);

const DICE_PIP_MAP = {
  1: ["center"],
  2: ["top-left", "bottom-right"],
  3: ["top-left", "center", "bottom-right"],
  4: ["top-left", "top-right", "bottom-left", "bottom-right"],
  5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
  6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
};

const clonePositions = (positions) => positions.map((tokens) => [...tokens]);

const getNextActivePlayer = (fromPlayer, finishedPlayers) => {
  for (let offset = 1; offset <= PLAYER_META.length; offset += 1) {
    const candidate = (fromPlayer + offset) % PLAYER_META.length;
    if (!finishedPlayers.includes(candidate)) {
      return candidate;
    }
  }

  return fromPlayer;
};

const LudoGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceRoll, setDiceRoll] = useState(null);
  const [displayDiceRoll, setDisplayDiceRoll] = useState(null);
  const [positions, setPositions] = useState(createInitialPositions);
  const [message, setMessage] = useState("Roll the dice to start the round.");
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const movableTokens = useMemo(
    () => getMovableTokenIndexes(currentPlayer, positions[currentPlayer], diceRoll),
    [currentPlayer, diceRoll, positions],
  );
  const currentPlayerHomeCount = positions[currentPlayer].filter(
    (progress) => progress === FINAL_PROGRESS,
  ).length;
  const currentPlayerInBaseCount = positions[currentPlayer].filter(
    (progress) => progress === -1,
  ).length;

  const tokenLayout = useMemo(() => {
    const layout = {};

    positions.forEach((playerTokens, playerIndex) => {
      playerTokens.forEach((progress, tokenIndex) => {
        const { row, col } = getTokenCoordinate(playerIndex, tokenIndex, progress);
        const key = getCellKey(row, col);

        if (!layout[key]) {
          layout[key] = [];
        }

        layout[key].push({ playerIndex, tokenIndex });
      });
    });

    return layout;
  }, [positions]);

  const getTokenStyles = (playerIndex, tokenIndex, progress) => {
    const { row, col } = getTokenCoordinate(playerIndex, tokenIndex, progress);
    const key = getCellKey(row, col);
    const stack = tokenLayout[key] ?? [];
    const stackIndex = stack.findIndex(
      (token) => token.playerIndex === playerIndex && token.tokenIndex === tokenIndex,
    );
    const offsets = [
      { x: 0, y: 0 },
      { x: -11, y: -11 },
      { x: 11, y: -11 },
      { x: -11, y: 11 },
      { x: 11, y: 11 },
    ];
    const offset =
      stack.length <= 1
        ? offsets[0]
        : offsets[Math.min(stackIndex + 1, offsets.length - 1)];

    return {
      gridRowStart: row,
      gridColumnStart: col,
      transform: `translate(${offset.x}px, ${offset.y}px)`,
    };
  };

  const resetGame = () => {
    setCurrentPlayer(0);
    setDiceRoll(null);
    setDisplayDiceRoll(null);
    setPositions(createInitialPositions());
    setFinishedPlayers([]);
    setConsecutiveSixes(0);
    setMessage("Fresh game. Red starts.");
  };

  const advanceTurn = (fromPlayer, nextFinishedPlayers) => {
    const remainingPlayers = PLAYER_META.filter(
      (player) => !nextFinishedPlayers.includes(player.id),
    );

    if (remainingPlayers.length <= 1) {
      setDiceRoll(null);
      setConsecutiveSixes(0);
      setMessage("Game over. Start a new match to play again.");
      return;
    }

    setCurrentPlayer(getNextActivePlayer(fromPlayer, nextFinishedPlayers));
    setDiceRoll(null);
    setConsecutiveSixes(0);
  };

  const rollDice = () => {
    if (diceRoll !== null) {
      setMessage("Move one of the highlighted tokens before rolling again.");
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const nextSixCount = roll === 6 ? consecutiveSixes + 1 : 0;
    setDisplayDiceRoll(roll);

    if (nextSixCount === 3) {
      setDiceRoll(null);
      setConsecutiveSixes(0);
      setMessage(
        `${PLAYER_META[currentPlayer].name} rolled three 6s in a row. The third 6 is canceled.`,
      );
      advanceTurn(currentPlayer, finishedPlayers);
      return;
    }

    const availableMoves = getMovableTokenIndexes(currentPlayer, positions[currentPlayer], roll);

    setDiceRoll(roll);
    setConsecutiveSixes(nextSixCount);

    if (availableMoves.length === 0) {
      if (roll === 6) {
        setMessage(
          `${PLAYER_META[currentPlayer].name} rolled a 6 but has no valid move. Roll again.`,
        );
        setDiceRoll(null);
        return;
      }

      setMessage(`${PLAYER_META[currentPlayer].name} rolled ${roll} and has no valid move.`);
      advanceTurn(currentPlayer, finishedPlayers);
      return;
    }

    setMessage(
      `${PLAYER_META[currentPlayer].name} rolled ${roll}. Select a glowing token to move.`,
    );
  };

  const moveToken = (playerIndex, tokenIndex) => {
    if (playerIndex !== currentPlayer || diceRoll === null || !movableTokens.includes(tokenIndex)) {
      return;
    }

    const nextPositions = clonePositions(positions);
    const currentProgress = nextPositions[playerIndex][tokenIndex];
    const nextProgress = currentProgress === -1 ? 0 : currentProgress + diceRoll;
    nextPositions[playerIndex][tokenIndex] = nextProgress;

    let captureHappened = false;

    if (nextProgress >= 0 && nextProgress <= 51 && !isSafeProgress(nextProgress)) {
      const landingCell = getTokenCoordinate(playerIndex, tokenIndex, nextProgress);

      nextPositions.forEach((tokens, otherPlayerIndex) => {
        if (otherPlayerIndex === playerIndex) {
          return;
        }

        tokens.forEach((otherProgress, otherTokenIndex) => {
          if (otherProgress < 0 || otherProgress > 51 || isSafeProgress(otherProgress)) {
            return;
          }

          const otherCell = getTokenCoordinate(otherPlayerIndex, otherTokenIndex, otherProgress);
          if (otherCell.row === landingCell.row && otherCell.col === landingCell.col) {
            nextPositions[otherPlayerIndex][otherTokenIndex] = -1;
            captureHappened = true;
          }
        });
      });
    }

    const playerFinished =
      nextPositions[playerIndex].every((progress) => progress === FINAL_PROGRESS) &&
      !finishedPlayers.includes(playerIndex);

    const nextFinishedPlayers = playerFinished
      ? [...finishedPlayers, playerIndex]
      : finishedPlayers;

    setPositions(nextPositions);
    setFinishedPlayers(nextFinishedPlayers);

    if (playerFinished) {
      setMessage(`${PLAYER_META[playerIndex].name} finished all four tokens and joins the winners board.`);
    } else if (nextProgress === FINAL_PROGRESS) {
      setMessage(`${PLAYER_META[playerIndex].name} brought a token home.`);
    } else if (captureHappened) {
      setMessage(`${PLAYER_META[playerIndex].name} captured an opponent and gets another turn.`);
    } else if (diceRoll === 6) {
      setMessage(`${PLAYER_META[playerIndex].name} rolled a 6 and gets another turn.`);
    } else {
      setMessage(`${PLAYER_META[playerIndex].name} moved token ${tokenIndex + 1}.`);
    }

    const earnsExtraTurn = diceRoll === 6 || captureHappened;
    const remainingPlayers = PLAYER_META.filter(
      (player) => !nextFinishedPlayers.includes(player.id),
    );

    if (remainingPlayers.length <= 1) {
      setDiceRoll(null);
      setConsecutiveSixes(0);
      return;
    }

    if (playerFinished) {
      setCurrentPlayer(getNextActivePlayer(playerIndex, nextFinishedPlayers));
      setDiceRoll(null);
      setConsecutiveSixes(0);
      return;
    }

    if (earnsExtraTurn) {
      setDiceRoll(null);
      return;
    }

    setCurrentPlayer(getNextActivePlayer(playerIndex, nextFinishedPlayers));
    setDiceRoll(null);
    setConsecutiveSixes(0);
  };

  return (
    <section className="game-shell">
      <div className="game-panel">
        <div className="header-row">
          <div className="player-strip" aria-label="Player summary">
            {PLAYER_META.map((player, playerIndex) => {
              const homeCount = positions[playerIndex].filter(
                (progress) => progress === FINAL_PROGRESS,
              ).length;
              const finished = finishedPlayers.includes(playerIndex);

              return (
                <div
                  key={player.name}
                  className={`player-card ${player.colorClass} ${
                    currentPlayer === playerIndex ? "is-current" : ""
                  } ${finished ? "is-finished" : ""}`}
                >
                  <span className="player-name">{player.name}</span>
                  <span className="player-stats">{homeCount}/4 home</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="board-and-score">
        <aside className="info-panel" aria-label="Game rules and status">
          <div className="panel-label">
            <span className="eyebrow">Guide</span>
            <h3>Rules And Status</h3>
          </div>
          <div className="info-dock">
            <div className="rules-card spotlight-card">
              <h3>How To Play</h3>
              <p>Roll once, then move one glowing token.</p>
              <p>Roll a 6 to bring a token out and earn another turn.</p>
            </div>

            <div className="rules-card">
              <h3>Safe Rules</h3>
              <p>Safe squares protect tokens from capture.</p>
              <p>Exact rolls are required to reach the center home.</p>
            </div>

            <div className="rules-card">
              <h3>Players</h3>
              {PLAYER_META.map((player, playerIndex) => (
                <p key={player.name}>
                  {player.name}:{" "}
                  {positions[playerIndex].filter((progress) => progress === FINAL_PROGRESS).length}/4
                  {" "}home
                </p>
              ))}
            </div>
          </div>
        </aside>

        <div className="play-area">
          <div className="board-frame">
            <div className="board-titlebar">
              <span className="eyebrow">Board</span>
              <h3>Ludo Arena</h3>
            </div>
            <div className="ludo-container">
              {boardSquares.map((square) => (
                <div
                  key={square.key}
                  className={`board-square ${getSquareColorClass(square.row, square.col)}`}
                  style={{ gridRowStart: square.row, gridColumnStart: square.col }}
                />
              ))}

              <div className="base red-base" />
              <div className="base green-base" />
              <div className="base yellow-base" />
              <div className="base blue-base" />
              <div className="center-home" aria-hidden="true" />

              {positions.map((playerTokens, playerIndex) =>
                playerTokens.map((progress, tokenIndex) => {
                  const isMovable =
                    playerIndex === currentPlayer && movableTokens.includes(tokenIndex);

                  return (
                    <button
                      key={`${playerIndex}-${tokenIndex}`}
                      type="button"
                      style={getTokenStyles(playerIndex, tokenIndex, progress)}
                      className={`token ${PLAYER_META[playerIndex].colorClass} ${
                        isMovable ? "is-movable" : ""
                      }`}
                      onClick={() => moveToken(playerIndex, tokenIndex)}
                      aria-label={`${PLAYER_META[playerIndex].name} token ${tokenIndex + 1}`}
                    >
                      {progress === -1 ? tokenIndex + 1 : ""}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <aside className="control-panel" aria-label="Current turn controls">
            <div className="panel-label">
              <span className="eyebrow">Turn Panel</span>
              <h3>Current Turn</h3>
            </div>
            <div className="turn-banner control-card">
              <div>
                <h2>{PLAYER_META[currentPlayer].name} Player</h2>
                <p className="status-copy">{message}</p>
              </div>
              <div
                className={`turn-chip ${PLAYER_META[currentPlayer].colorClass}`}
                aria-label={`${PLAYER_META[currentPlayer].name} player's turn`}
              >
                {PLAYER_META[currentPlayer].name}
              </div>
              <div className="turn-stats" aria-label="Current player stats">
                <div className="turn-stat">
                  <span className="turn-stat-label">Home</span>
                  <strong>{currentPlayerHomeCount}/4</strong>
                </div>
                <div className="turn-stat">
                  <span className="turn-stat-label">In Base</span>
                  <strong>{currentPlayerInBaseCount}</strong>
                </div>
                <div className="turn-stat">
                  <span className="turn-stat-label">Playable</span>
                  <strong>{diceRoll === null ? "-" : movableTokens.length}</strong>
                </div>
              </div>
              <p className="turn-tip">
                Tip: tokens glow when they can move for the current dice value.
              </p>
            </div>

            <div className="controls-row control-card">
              <button className="dice-button" onClick={rollDice} type="button">
                <span className="dice-label">Roll Dice</span>
                <span className="dice-face" aria-hidden="true">
                  <span className={`dice-cube ${diceRoll === null ? "is-idle" : ""}`}>
                    {(DICE_PIP_MAP[displayDiceRoll] ?? []).map((position) => (
                      <span key={position} className={`dice-pip ${position}`} />
                    ))}
                  </span>
                </span>
                <span className="dice-value">{diceRoll ? `Value ${diceRoll}` : "Waiting"}</span>
              </button>
              <button className="secondary-button" onClick={resetGame} type="button">
                Restart Match
              </button>
            </div>
          </aside>

          <div className="play-summary rules-card">
            <div className="summary-header">
              <span className="eyebrow">Overview</span>
              <h3>Match Summary</h3>
            </div>
            <div className="play-summary-grid">
              <p>Current player: {PLAYER_META[currentPlayer].name}</p>
              <p>Finished players: {finishedPlayers.length}</p>
              <p>Tokens at home: {positions.flat().filter((progress) => progress === FINAL_PROGRESS).length}</p>
              <p>Tokens in base: {positions.flat().filter((progress) => progress === -1).length}</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="finished-footer">
        <div className="rules-card finished-card">
          <div className="finished-header">
            <h3>Finished</h3>
            <p className="finished-subtitle">Track winners and match progress here.</p>
          </div>
          <div className="finished-content">
            <div className="finished-list">
              {finishedPlayers.length === 0 ? (
                <p>No one has finished yet.</p>
              ) : (
                finishedPlayers.map((playerIndex, order) => (
                  <p key={PLAYER_META[playerIndex].name}>
                    {order + 1}. {PLAYER_META[playerIndex].name}
                  </p>
                ))
              )}
            </div>
            <div className="finished-summary">
              <p>
                Active players left: {PLAYER_META.length - finishedPlayers.length}
              </p>
              <p>First player to bring all 4 tokens home wins the match.</p>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default LudoGame;
