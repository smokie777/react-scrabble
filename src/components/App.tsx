// import { useState } from 'react';
import { Board } from './Board';
import './App.scss';

export const App = () => {
  // const [coordinates, setCoordinates] = useState<SquareCoordinateMap>({});

  return (
    <div className='app'>
      <Board />
    </div>
  );
};
