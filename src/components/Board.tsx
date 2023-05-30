import { board } from '../game/board';
import './Board.scss';
import { tileMap } from '../game/tiles';
import { Tile } from './Tile';
import { PlacedTiles } from '../game/types';

export const Board = ({
   placedTiles,
   tempPlacedTiles,
   placeSelectedTile,
   highlightedSquaresMap
}:{
  placedTiles:PlacedTiles,
  tempPlacedTiles:PlacedTiles,
  placeSelectedTile:Function,
  highlightedSquaresMap:{[key:string]:Boolean}
}) => (
  <div className='board'>
    {board.map(row => (
      row.map(square => {
        const coordinateString = `${square.x},${square.y}`;
        return (
          <div
            key={coordinateString}
            className='square'
            style={{
              background: square.color,
              border: highlightedSquaresMap[coordinateString] ? '1px solid yellow' : '1px solid black'
            }}
            onClick={() => placeSelectedTile(square.x, square.y)}
          >
            <div style={{ position: 'absolute', top: 0, left: 0 }}>({square.x}, {square.y})</div>
            <div>{square.text}</div>
            {placedTiles[coordinateString] ? (
              <Tile
                letter={placedTiles[coordinateString].letter}
                points={tileMap[placedTiles[coordinateString].letter].points}
              />
            ) : null}
            {tempPlacedTiles[coordinateString] ? (
              <Tile
                letter={tempPlacedTiles[coordinateString].letter}
                points={tileMap[tempPlacedTiles[coordinateString].letter].points}
              />
            ) : null}
          </div>
        );
      })
    ))}
  </div>
);
