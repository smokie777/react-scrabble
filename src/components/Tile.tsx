import './Tile.scss';
import { noop } from 'lodash';

export const Tile = ({
  letter,
  points,
  index = -1,
  onClick = noop,
  isSelected = false
}:{
  letter:string,
  points:number,
  index?:number,
  onClick?:Function,
  isSelected?:Boolean
}) => (
  <div className={`tile ${isSelected ? 'selected' : ''}`} onClick={() => onClick(index)}>
    <div className='letter'>{letter}</div>
    <div className='points'>{points}</div>
  </div>
);
