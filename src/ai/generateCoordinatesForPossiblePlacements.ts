import { PlacedTiles, Tile } from '../game/types';
import { directionMatrix } from './DirectionMatrix';

export const generateCoordinatesForPossiblePlacements = (
  placedTiles:PlacedTiles, // map of all tiles on the board
  tempPlacedTiles:PlacedTiles, // map of all temp tile placements for move calculation
) => {
  // generates an array of all valid stringCoordinates to place one letter, given board states.
  const numLettersPlaced = Object.keys(tempPlacedTiles).length;
  const coordinates:{x:number,y:number}[] = [];

  if (!numLettersPlaced) {
    // the first letter can be placed anywhere adjacent to a pre-existing placed letter.
    Object.values(placedTiles).forEach(placedTile => {
      directionMatrix.forEach(i => {
        const coordinateString = `${placedTile.x + i[0]},${placedTile.y + i[1]}`;
        if (
          placedTile.x + i[0] >= 0 && placedTile.x + i[0] <= 14
          && placedTile.y + i[1] >= 0 && placedTile.y + i[1] <= 14
          && !placedTiles.hasOwnProperty(coordinateString)
        ) {
          coordinates.push({ x: placedTile.x + i[0], y: placedTile.y + i[1] });
        }
      })
    });
  } else {
    const possibleDirections = numLettersPlaced === 1
      // the second letter must only be placed on the same row or column as the first letter.
      ? directionMatrix
      // the third and onwards letters must only be placed on the same row or column as the first two letters were on.
      : (
        Object.values(tempPlacedTiles)[0].x === Object.values(tempPlacedTiles)[1].x
          ? directionMatrix.slice(0, 2)
          : directionMatrix.slice(2)
      )
    ;
    possibleDirections.forEach(i => {
      // from first letter, travel in all directions until either an empty square or the edge of the board is found.
      let counter = 1;
      const startTile:Tile = Object.values(tempPlacedTiles)[0];
      while (true) {
        const coordinateString = `${startTile.x + i[0] * counter},${startTile.y + i[1] * counter}`;
        if (
          startTile.x + i[0] * counter < 0 || startTile.x + i[0] * counter > 14
          || startTile.y + i[1] * counter < 0 || startTile.y + i[1] * counter > 14
        ) {
        // if out of bounds, stop searching in that direction.
          return;
        } else if (
          !placedTiles.hasOwnProperty(coordinateString)
          && !tempPlacedTiles.hasOwnProperty(coordinateString)
        ) {
          // if empty square is found, add coordinates, then proceed to the next direction.
          coordinates.push({ x: startTile.x + i[0] * counter, y: startTile.y + i[1] * counter });
          return;
        } else {
          // if non-empty, in-bounds square is found, keep searching in that direction.
          counter++;
        }
      }
    });
  }

  return coordinates;
};
