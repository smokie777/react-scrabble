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
import { generateCoordinateString } from '../game/generateCoordinateString';

export const App = () => {
  // const [playerTiles, setPlayerTiles] = useState<TilesType>(Array(7).fill(null));
  const [playerTiles, setPlayerTiles] = useState<TilesType>('GOGOGOO'.split(''));
  // const [AITiles, setAITiles] = useState<TilesType>(Array(7).fill(null));
  const [AITiles, setAITiles] = useState<TilesType>('ROASTIN'.split(''));
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    // '6,7': { ...tileMap['R'], x: 6, y: 7 },
    // '7,7': { ...tileMap['I'], x: 7, y: 7 },
    // '8,7': { ...tileMap['C'], x: 8, y: 7 },
    // '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });
  const [tempPlacedTiles, setTempPlacedTiles] = useState<PlacedTiles>({});
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState(-1);
  const [turn, setTurn] = useState(1); // odd turns are player's turns, even turns are AI's

  const bagRef = useRef(generateBag());

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
    const coordinateString = generateCoordinateString(x, y);
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

  const AIPlayWord = () => {
    // AI turn - play
    const processedAITiles:string[] = [];
    AITiles.forEach(i => {
      if (i !== null) {
        processedAITiles.push(i)
      }
    });
    processedAITiles.sort((a, b) => tileMap[b].points - tileMap[a].points);
    const AIMove = generateAIMove(placedTiles, processedAITiles);
    if (AIMove) {
      const newPlacedTiles = {
        ...placedTiles,
        ...AIMove.placedTiles
      };
      setPlacedTiles(newPlacedTiles);
      const remainingTiles:TilesType = [];
      for (let i = 0; i < 7; i++) {
        if (AIMove.AIRemainingTiles[i]) {
          remainingTiles.push(AIMove.AIRemainingTiles[i]);
        } else {
          remainingTiles.push(null);
        }
      }
      drawTiles('AI', remainingTiles);
      const log:Log = {
        turn,
        action: 'move',
        words: AIMove.words.map(word => ({
          word: word.map(tile => tile.letter).join(''),
          score: generateWordScore(placedTiles, word)
        })),
        score: AIMove.score,
        isBingo: Object.keys(AIMove.placedTiles).length === 7
      };
      setLogs([...logs, log]);
    } else {
      // AI turn - pass
      const log:Log = {
        turn,
        action: 'pass',
        words: [],
        score: 0,
        isBingo: false
      };
      setLogs([...logs, log]);
    }
    
    setTurn(turn + 1);
  };

  const playerPlayWord = () => {
    if (turn % 2 === 0) {
      return;
    }

    const playerMove = generatePlayerMove(placedTiles, tempPlacedTiles)[0];
    if (playerMove) {
      // player turn - play
      const newPlacedTiles = {
        ...placedTiles,
        ...playerMove.placedTiles
      };
      setPlacedTiles(newPlacedTiles);
      setTempPlacedTiles({});
      drawTiles('player', playerTiles);
      const log:Log = {
        turn,
        action: 'move',
        words: playerMove.words.map(word => ({
          word: word.map(tile => tile.letter).join(''),
          score: generateWordScore(placedTiles, word)
        })),
        score: playerMove.score,
        isBingo: Object.keys(playerMove.placedTiles).length === 7
      };
      setLogs([...logs, log]);
    } else {
      // player turn - play invalid word
      return unplaceSelectedTiles(Object.keys(tempPlacedTiles));
    }
    
    setTurn(turn + 1);
  };

  useEffect(() => {
    drawTiles('player', playerTiles);
    drawTiles('AI', AITiles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (turn % 2 === 0) {
      setTimeout(() => {
        AIPlayWord();
      }, 100);
      // ^ this timeout duration must be a value greater than the time it takes setState() to run.
      // if 0, there's a race condition between whether AIPlayWord() is evaluated first, or setState() in playerPlayWord().
      // if not using setTimeout(), AIPlayWord() will always be evaluated before setState() in playerPlayWord(), meaning it would be impossible to set any states until AIPlayWord() finishes calculating.
      // if there was an easy way to utilize multithreading in React here, the setTimeout() would be unnecessary. there are some packages for this, but i didn't really want to download them.
      // so, for now, we just pray that setState() always finishes in less than 100ms, and just take the loss by having the AI turn be 100ms longer. (in the 0.01% chance setState takes longer than 100ms, the only negative effect would be the game UI would not update until the AI finishes its turn.)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

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
          <div 
            className={`button ${turn % 2 === 0 ? 'loading' : ''}`}
            onClick={playerPlayWord}
          >
            Play Word
          </div>
        </FlexContainer>
      </div>
    </div>
  );
};
