import { tileMap } from '../game/tiles';
import { Tiles as TilesType } from '../game/types';
import { Tile } from './Tile';

export const Tiles = ({ tiles }:{ tiles:TilesType}) => {
  return (
    <div className='tiles'>
      {tiles.map((tile, index) => tile === null ? (
        <div key={index} className='tile hidden' />
      ) : (
        <Tile key={index} letter={tileMap[tile].letter} points={tileMap[tile].points} />
      ))}
    </div>
  );
};
