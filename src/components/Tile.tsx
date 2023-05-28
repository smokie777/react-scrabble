import { Tile as TileProps } from '../game/types';
import './Tile.scss';

export const Tile = ({ letter, points }: TileProps) => (
  <div className='tile'>
    <div className='letter'>{letter}</div>
    <div className='points'>{points}</div>
  </div>
);
