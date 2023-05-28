import { useState, useEffect } from 'react';
import { board } from '../game/board';
import './Board.scss';
import { tileMap } from '../game/tiles';
import { Tile } from './Tile';
import { PlacedTiles } from '../game/types';
import { generateAIMove } from '../ai/generateAIMove';
// import { invalidSequences } from './invalidSequences';

export const Board = () => {
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    '6,7': { ...tileMap['R'], x: 6, y: 7 },
    '7,7': { ...tileMap['I'], x: 7, y: 7 },
    '8,7': { ...tileMap['C'], x: 8, y: 7 },
    '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });

  useEffect(() => {
    generateAIMove(placedTiles, ['A', 'E', 'I', 'O', 'U', 'S', 'R']);
  }, []);

  return (
    <div className='board'>
      {board.map(row => (
        row.map(square => {
          const coordinateString = `${square.x},${square.y}`;
          return (
            <div
              key={coordinateString}
              className='square'
              style={{ background: square.color }}
              // onClick={() => {
              //   const newCoordinates = { ...coordinates };
              //   if (coordinates[coordinateString]) {
              //     delete newCoordinates[coordinateString];
              //   } else {
              //     newCoordinates[coordinateString] = square;
              //   }
              //   setCoordinates(newCoordinates);
              //   console.log(Object.keys(newCoordinates));
              // }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0 }}>({square.x}, {square.y})</div>
              <div>{square.text}</div>
              {placedTiles[coordinateString] ? (
                <Tile
                  letter={placedTiles[coordinateString].letter}
                  points={tileMap[placedTiles[coordinateString].letter].points}
                />
              ) : null}
            </div>
          );
        })
      ))}
    </div>
  )
};