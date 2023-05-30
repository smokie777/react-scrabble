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

export const App = () => {
  const bagRef = useRef(generateBag().slice(0, 20));
  const turnRef = useRef(1);
  const [playerTiles, setPlayerTiles] = useState<TilesType>(Array(7).fill(null));
  const [AITiles, setAITiles] = useState<TilesType>(Array(7).fill(null));
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    '6,7': { ...tileMap['R'], x: 6, y: 7 },
    '7,7': { ...tileMap['I'], x: 7, y: 7 },
    '8,7': { ...tileMap['C'], x: 8, y: 7 },
    '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });
  const [logs, setLogs] = useState<Log[]>([]);

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
  }, []);

  const handleButtonOnClick = () => {
    const processedAITiles:string[] = [];
    AITiles.forEach(i => {
      if (i !== null) {
        processedAITiles.push(i)
      }
    });
    processedAITiles.sort((a, b) => tileMap[b].points - tileMap[a].points);
    const move = generateAIMove(placedTiles, processedAITiles);
    if (move) {
      setPlacedTiles({
        ...placedTiles,
        ...move.placedTiles
      });
      const remainingTiles:TilesType = [];
      for (let i = 0; i < 7; i++) {
        if (move.remainingTiles[i]) {
          remainingTiles.push(move.remainingTiles[i]);
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
          score: generateWordScore(word)
        })),
        score: move.score
      };
      setLogs([...logs, log])
    } else {
      const log:Log = {
        turn: turnRef.current,
        action: 'pass',
        words: [],
        score: 0
      };
      setLogs([...logs, log]);
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
          <Board placedTiles={placedTiles} setPlacedTiles={setPlacedTiles} />
          <Tiles tiles={playerTiles} />
        </FlexContainer>
        <FlexContainer
          className='right_section'
          flexDirection='column'
          justifyContent='flex-end'
          alignItems='center'
        >
          <Logs logs={logs} />
          <div className='button' onClick={handleButtonOnClick}>
            End Turn (Enter)
          </div>
        </FlexContainer>
      </div>
    </div>
  );
};
