import { useState } from 'react';
import { Board } from './Board';
import './App.scss';
import { Tile } from './Tile';
import { tileMap } from '../game/tiles';
import { FlexContainer } from './FlexContainer';
import { PlacedTiles } from '../game/types';

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
  )
}

export const App = () => {
  // const [coordinates, setCoordinates] = useState<SquareCoordinateMap>({});
  const [yourTiles, setYourTiles] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  const [AITiles, setAITiles] = useState(['H', 'I', 'J', 'K', 'L', 'N', 'M']);
  const [placedTiles, setPlacedTiles] = useState<PlacedTiles>({
    '6,7': { ...tileMap['R'], x: 6, y: 7 },
    '7,7': { ...tileMap['I'], x: 7, y: 7 },
    '8,7': { ...tileMap['C'], x: 8, y: 7 },
    '9,7': { ...tileMap['E'], x: 9, y: 7 },
  });

  return (
    <div className='app'>
      <div className='game'>
        <FlexContainer className='left_section' flexDirection='column' justifyContent='flex-end'>
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
          <Tiles tiles={yourTiles} />
        </FlexContainer>
        <div className='right_section'>
          
        </div>
      </div>
    </div>
  );
};
