import './Tile.scss';

export const Tile = ({ letter, points }: { letter:string, points:number }) => (
  <div className='tile'>
    <div className='letter'>{letter}</div>
    <div className='points'>{points}</div>
  </div>
);
