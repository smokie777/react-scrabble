import { useState, useRef, useEffect } from 'react';
import { Board } from './Board';
import './App.scss';
import { Tiles } from './Tiles';
import { Logs } from './Logs';
import { LetterDistribution } from './LetterDistribution';
import { generateBag, tileMap } from '../game/tiles';
import { FlexContainer } from './FlexContainer';
import { Log, PlacedTiles, Tiles as TilesType } from '../game/types';
import { generateAIMove } from '../ai/generateAIMove';
import { generateWordScore } from '../ai/generateWordScore';
import { generatePlayerMove } from '../ai/generatePlayerMove';

export const App = () => {
  const [playerTiles, setPlayerTiles] = useState<TilesType>(Array(7).fill(null));
  const [AITiles, setAITiles] = useState<TilesType>(Array(7).fill(null));
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    // '6,7': { ...tileMap['R'], x: 6, y: 7 },
    // '7,7': { ...tileMap['I'], x: 7, y: 7 },
    // '8,7': { ...tileMap['C'], x: 8, y: 7 },
    // '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });
  const [tempPlacedTiles, setTempPlacedTiles] = useState<PlacedTiles>({});
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState(-1);

  const bagRef = useRef(generateBag());
  const turnRef = useRef(1); // odd turns are player's turns, even turns are AI's

  const unplaceSelectedTiles = (coordinates:string[]) => {
    // remove player's placed tile from board and put it back into player's hand
    const newPlayerTiles = [...playerTiles];
    const newTempPlacedTiles = { ...tempPlacedTiles };
    coordinates.forEach(coordinateString => {
      delete newTempPlacedTiles[coordinateString];
      newPlayerTiles[newPlayerTiles.indexOf(null)] = tempPlacedTiles[coordinateString].letter;
    });
    setPlayerTiles(newPlayerTiles);
    setTempPlacedTiles(newTempPlacedTiles);
  };

  const placeSelectedTile = (x:number, y:number) => {
    // place tile from player's hand onto the board
    const coordinateString = `${x},${y}`;
    const letter = playerTiles[selectedTileIndex];
    if (typeof letter === 'string') {
      const newTempPlacedTiles = {
        ...tempPlacedTiles,
        [coordinateString]: { ...tileMap[letter], x, y }
      };
      setTempPlacedTiles(newTempPlacedTiles);
      const newPlayerTiles = [...playerTiles];
      newPlayerTiles[selectedTileIndex] = null;
      setPlayerTiles(newPlayerTiles);
      setSelectedTileIndex(-1);
    }
  };

  const drawTiles = (player:string, remainingTiles:TilesType) => {
    const newTiles:TilesType = [...remainingTiles];
    for (let i = 0; i < 7; i++) {
      if (bagRef.current.length && newTiles[i] === null) {
        const tile = bagRef.current.pop();
        if (tile) {
          newTiles[i] = tile;
        }
      }
    }
    if (player === 'player') {
      setPlayerTiles(newTiles);
    } else {
      setAITiles(newTiles);
    }
  };

  useEffect(() => {
    drawTiles('player', playerTiles);
    drawTiles('AI', AITiles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonOnClick = () => {
    if (turnRef.current % 2 === 0) {
      // AI turn - play
      const processedAITiles:string[] = [];
      AITiles.forEach(i => {
        if (i !== null) {
          processedAITiles.push(i)
        }
      });
      processedAITiles.sort((a, b) => tileMap[b].points - tileMap[a].points);
      const move = generateAIMove(placedTiles, processedAITiles);
      if (move) {
        const newPlacedTiles = {
          ...placedTiles,
          ...move.placedTiles
        };
        setPlacedTiles(newPlacedTiles);
        const remainingTiles:TilesType = [];
        for (let i = 0; i < 7; i++) {
          if (move.AIRemainingTiles[i]) {
            remainingTiles.push(move.AIRemainingTiles[i]);
          } else {
            remainingTiles.push(null);
          }
        }
        drawTiles('AI', remainingTiles);
        const log:Log = {
          turn: turnRef.current,
          action: 'move',
          words: move.words.map(word => ({
            word: word.map(tile => tile.letter).join(''),
            score: generateWordScore(placedTiles, word)
          })),
          score: move.score
        };
        setLogs([...logs, log])
      } else {
        // AI turn - pass
        const log:Log = {
          turn: turnRef.current,
          action: 'pass',
          words: [],
          score: 0
        };
        setLogs([...logs, log]);
      }
    } else {
      const move = generatePlayerMove(placedTiles, tempPlacedTiles)[0];
      if (move) {
        // player turn - play
        const newPlacedTiles = {
          ...placedTiles,
          ...move.placedTiles
        };
        setPlacedTiles(newPlacedTiles);
        setTempPlacedTiles({});
        drawTiles('player', playerTiles);
        const log:Log = {
          turn: turnRef.current,
          action: 'move',
          words: move.words.map(word => ({
            word: word.map(tile => tile.letter).join(''),
            score: generateWordScore(placedTiles, word)
          })),
          score: move.score
        };
        setLogs([...logs, log])
        return; //testing
      } else {
        // player turn - play invalid word
        return unplaceSelectedTiles(Object.keys(tempPlacedTiles));
      }
    }

    turnRef.current++;
  };

  return (
    <div className='app'>
      <div className='game'>
        <FlexContainer
          className='left_section'
          flexDirection='column'
          justifyContent='flex-end'
          alignItems='flex-end'
        >
          <LetterDistribution placedTiles={placedTiles} />
        </FlexContainer>
        <FlexContainer
          className='board_and_tiles_container'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
        >
          <Tiles tiles={AITiles} />
          <Board
            placedTiles={placedTiles}
            tempPlacedTiles={tempPlacedTiles}
            placeSelectedTile={placeSelectedTile}
            unplaceSelectedTiles={unplaceSelectedTiles}
          />
          <Tiles
            tiles={playerTiles}
            selectedTileIndex={selectedTileIndex}
            setSelectedTileIndex={setSelectedTileIndex}
          />
        </FlexContainer>
        <FlexContainer
          className='right_section'
          flexDirection='column'
          justifyContent='flex-end'
          alignItems='center'
        >
          <Logs logs={logs} />
          <div className='button' onClick={handleButtonOnClick}>
            Click me! (Enter)
          </div>
        </FlexContainer>
      </div>
    </div>
  );
};
