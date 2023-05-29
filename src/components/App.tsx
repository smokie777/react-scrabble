import { useState, useRef, useEffect } from 'react';
import { Board } from './Board';
import './App.scss';
import { Tile } from './Tile';
import { generateBag, tileMap } from '../game/tiles';
import { FlexContainer } from './FlexContainer';
import { PlacedTiles } from '../game/types';
import { generateAIMove } from '../ai/generateAIMove';

const Tiles = ({ tiles }:{ tiles:string[]}) => {
  return (
    <div className='tiles'>
      {tiles.map((tile, index) => (
        <Tile key={index} letter={tileMap[tile].letter} points={tileMap[tile].points} />
      ))}
    </div>
  );
};

const LetterDistribution = ({ placedTiles }:{ placedTiles:PlacedTiles }) => {
  const placedTileCounts:{[key:string]:number} = {};
  Object.values(placedTiles).forEach(tile => {
    if (placedTileCounts.hasOwnProperty(tile.letter)) {
      placedTileCounts[tile.letter]++;
    } else {
      placedTileCounts[tile.letter] = 0;
    }
  });

  const letterDistributionStrings = Object.values(tileMap).map(tile => (
    `${tile.letter}- ${placedTileCounts[tile.letter] || 0}/${tileMap[tile.letter].count}`
  ));

  return (
    <FlexContainer className='letter_distribution' flexDirection='column' alignItems='center'>
      <div>LETTER</div>
      <div>DISTRIBUTION</div>
      <br />
      <FlexContainer className='letter_counts'>
        {[0, 13].map(offset => (
          <FlexContainer
            key={offset}
            className='letter_distribution_col'
            flexDirection='column'
            alignItems={offset ? 'flex-end' : 'flex-start'}
          >
            {letterDistributionStrings.slice(0 + offset, 13 + offset).map((i, index) => (
              <div key={index}>{i}</div>
            ))}
          </FlexContainer>
        ))}
      </FlexContainer>
      <div>{letterDistributionStrings[letterDistributionStrings.length - 1]}</div>
    </FlexContainer>
  );
};

export const App = () => {
  // const [coordinates, setCoordinates] = useState<SquareCoordinateMap>({});
  const bag = useRef(generateBag());
  const [playerTiles, setPlayerTiles] = useState<string[]>([]);
  const [AITiles, setAITiles] = useState<string[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    '6,7': { ...tileMap['R'], x: 6, y: 7 },
    '7,7': { ...tileMap['I'], x: 7, y: 7 },
    '8,7': { ...tileMap['C'], x: 8, y: 7 },
    '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });

  const drawTiles = (player:string, remainingTiles:string[]) => {
    const newTiles = [...remainingTiles];
    const numTilesToDraw = 7 - newTiles.length;
    for (let i = 0; i < numTilesToDraw; i++) {
      if (bag.current.length) {
        const tile = bag.current.pop();
        if (tile) {
          newTiles.push(tile);
        }
      }
    }
    if (player === 'player') {
      setPlayerTiles(newTiles);
    } else {
      setAITiles(newTiles);
    }
  };

  useEffect(() => {
    drawTiles('player', []);
    drawTiles('AI', []);
  }, []);

  console.log('tiles left in bag: ', bag.current.length);

  const handleButtonOnClick = () => {
    const move = generateAIMove(placedTiles, AITiles);
    if (move) {
      setPlacedTiles({
        ...placedTiles,
        ...move.placedTiles
      });
      drawTiles('AI', move.remainingTiles);
    } else {
      console.log('no valid moves!');
    }
  };

  return (
    <div className='app'>
      <div className='game'>
        <FlexContainer
          className='left_section'
          flexDirection='column'
          justifyContent='flex-end'
          alignItems='flex-end'
        >
          <LetterDistribution placedTiles={placedTiles} />
        </FlexContainer>
        <FlexContainer
          className='board_and_tiles_container'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
        >
          <Tiles tiles={AITiles} />
          <Board placedTiles={placedTiles} setPlacedTiles={setPlacedTiles} />
          <Tiles tiles={playerTiles} />
        </FlexContainer>
        <FlexContainer
          className='right_section'
          flexDirection='column'
          justifyContent='flex-end'
          alignItems='flex-start'
        >
          <div className='button' onClick={handleButtonOnClick}>
            End Turn (Enter)
          </div>
        </FlexContainer>
      </div>
    </div>
  );
};
