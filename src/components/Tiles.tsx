import { tileMap } from '../game/tiles';
import { Tiles as TilesType } from '../game/types';
import { Tile } from './Tile';
import { noop } from 'lodash';

export const Tiles = ({
  tiles,
  setSelectedTileIndex = noop,
  selectedTileIndex = -1,
}:{
  tiles:TilesType,
  selectedTileIndex?:number,
  setSelectedTileIndex?:Function,
}) => {
  return (
    <div className='tiles'>
      {tiles.map((tile, index) => tile === null ? (
        <div key={index} className='tile hidden' />
      ) : (
        <Tile
          key={index}
          letter={tileMap[tile].letter}
          points={tileMap[tile].points}
          index={index}
          onClick={setSelectedTileIndex}
          isSelected={selectedTileIndex === index}
        />
      ))}
    </div>
  );
};
