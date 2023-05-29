import { tileMap } from '../game/tiles';
import { Tile } from './Tile';

export const Tiles = ({ tiles }:{ tiles:string[]}) => {
  return (
    <div className='tiles'>
      {tiles.map((tile, index) => (
        <Tile key={index} letter={tileMap[tile].letter} points={tileMap[tile].points} />
      ))}
    </div>
  );
};
