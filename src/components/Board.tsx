import { useState } from 'react';
import { board } from '../game/board';
import './Board.scss';
import { tiles } from '../game/tiles';
import { Tile } from './Tile';
// import { invalidSequences } from './invalidSequences';

export const Board = () => {
  const [placedTiles, setPlacedTiles] = useState<{[key:string]: string}>({
    '6,7': 'R',
    '7,7': 'I',
    '8,7': 'C',
    '9,7': 'E',
  });

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
              {/* ({square.x}, {square.y}) */}
              <div>{square.text}</div>
              {placedTiles[coordinateString] ? (
                <Tile {...tiles[tiles.map(i => i.letter).indexOf(placedTiles[coordinateString])]} />
              ) : null}
            </div>
          );
        })
      ))}
    </div>
  )
};
