import { useState, useRef, useEffect } from 'react';
import { Board } from './Board';
import './App.scss';
import { Tiles } from './Tiles';
import { Logs } from './Logs';
import { LetterDistribution } from './LetterDistribution';
import { generateBag, tileMap } from '../game/tiles';
import { FlexContainer } from './FlexContainer';
import { Log, PlacedTiles } from '../game/types';
import { generateAIMove } from '../ai/generateAIMove';
import { generateWordScore } from '../ai/generateWordScore';

export const App = () => {
  const bagRef = useRef(generateBag());
  const turnRef = useRef(1);
  const [playerTiles, setPlayerTiles] = useState<string[]>([]);
  const [AITiles, setAITiles] = useState<string[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    '6,7': { ...tileMap['R'], x: 6, y: 7 },
    '7,7': { ...tileMap['I'], x: 7, y: 7 },
    '8,7': { ...tileMap['C'], x: 8, y: 7 },
    '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });
  const [logs, setLogs] = useState<Log[]>([]);

  const drawTiles = (player:string, remainingTiles:string[]) => {
    const newTiles = [...remainingTiles];
    const numTilesToDraw = 7 - newTiles.length;
    for (let i = 0; i < numTilesToDraw; i++) {
      if (bagRef.current.length) {
        const tile = bagRef.current.pop();
        if (tile) {
          newTiles.push(tile);
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
    drawTiles('player', []);
    drawTiles('AI', []);
  }, []);

  const handleButtonOnClick = () => {
    const move = generateAIMove(placedTiles, AITiles);
    if (move) {
      setPlacedTiles({
        ...placedTiles,
        ...move.placedTiles
      });
      drawTiles('AI', move.remainingTiles);
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
