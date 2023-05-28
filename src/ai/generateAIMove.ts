import { tileMap } from '../game/tiles';
import { uniq } from 'lodash';
import { PlacedTiles, Tile } from '../game/types';
import { sowpods } from '../game/sowpods';
import { invalidSequences } from '../game/invalidSequences';
import { board } from '../game/board';
import { keyBy } from 'lodash';

const generateMoveScore = (words:Tile[][]) => {
  let totalScore = 0;

  words.forEach(word => {
    const wordScoreMultipliers:number[] = [];
    let baseWordScore = 0;
    word.forEach(letter => {
      const { x, y, points } = letter;
      baseWordScore += points * board[y][x].letterScoreModifier;
      wordScoreMultipliers.push(board[y][x].wordScoreModifier);
    });
    wordScoreMultipliers.forEach(multiplier => {
      baseWordScore *= multiplier;
    });
    totalScore += baseWordScore;
  });

  return totalScore;
};

type moves = Array<{
  placedTiles:PlacedTiles,
  words:Tile[][],
  score:number
}>
const generateAIMoves = (
  placedTiles:PlacedTiles, // map of all tiles on the board
  tiles:string[], // array of all tiles in ai's hand
  tempPlacedTiles:PlacedTiles, // map of all temp tile placements for move calculation
  placementCache:{[key:string]:boolean}, // cache of all already-explored placements to prevent dupes
  horizontalSequences:Tile[][], // all horizontal sequences generated so far
  verticalSequences:Tile[][], // all vertical sequences generated so far
  moves:moves, // array of all possible moves. populated by this function.
  depth:number // recursion depth, aka how many letters can the AI play at once.
) => {
  // create an array of all possible ways to place one letter
  const tilesDeduped:string[] = uniq(tiles);
  const placements:PlacedTiles = {};
  if (depth === 0) {
    // the first letter can be placed anywhere adjacent to a pre-existing placed letter.
    Object.values(placedTiles).forEach(placedTile => {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(i => {
        const coordinateString = `${placedTile.x + i[0]},${placedTile.y + i[1]}`;
        if (
          placedTile.x + i[0] >= 0 && placedTile.x + i[0] <= 14
          && placedTile.y + i[1] >= 0 && placedTile.y + i[1] <= 14
          && !placedTiles.hasOwnProperty(coordinateString)
          && !tempPlacedTiles.hasOwnProperty(coordinateString)
        ) {
          tilesDeduped.forEach(tile => {
            placements[`${coordinateString},${tile}`] = {
              ...tileMap[tile],
              x: placedTile.x + i[0],
              y: placedTile.y + i[1]
            };
          });
        }
      })
    });
  } else if (depth >= 1) {
    const possibleDirections = depth === 1
      // the second letter must only be placed on the same row or column as the first letter.
      ? [[0, 1], [0, -1], [1, 0], [-1, 0]]
      // the third and onwards letters must only be placed on the same row or column as the first two letters were on.
      : (
        Object.values(tempPlacedTiles)[0].x === Object.values(tempPlacedTiles)[1].x
          ? [[0, 1], [0, -1]]
          : [[1, 0], [-1, 0]]
    );
    possibleDirections.forEach(i => {
      // from first letter, travel in all directions until either an empty square or the edge of the board is found.
      let counter = 1;
      const firstTile:Tile = Object.values(tempPlacedTiles)[0];
      while (true) {
        const coordinateString = `${firstTile.x + i[0] * counter},${firstTile.y + i[1] * counter}`;
        if (
          firstTile.x + i[0] * counter < 0 || firstTile.x + i[0] * counter > 14
          || firstTile.y + i[1] * counter < 0 || firstTile.y + i[1] * counter > 14
        ) {
        // if out of bounds, stop searching in that direction.
          return;
        } else if (!placedTiles.hasOwnProperty(coordinateString)) {
          // if empty square is found, add placements, then proceed to the next direction.
          // eslint-disable-next-line no-loop-func
          tilesDeduped.forEach(tile => {
            placements[`${coordinateString},${tile}`] = {
              ...tileMap[tile],
              x: firstTile.x + i[0] * counter,
              y: firstTile.y + i[1] * counter
            };
          });
          return;
        } else {
          // if non-empty square is found, keep searching in that direction.
          counter++;
        }
      }
    });
  }

  // iterate through all placements, and process horizontal and vertical sequence created by that placement
  Object.values(placements).forEach(placement => {
    const newTempPlacedTiles = { ...tempPlacedTiles };
    newTempPlacedTiles[`${placement.x},${placement.y}`] = placement;
    // cache a unique id based on placement coordinates and letter to prevent duplicate iterations
    // such as iterating on 5,5 -> 5,6, and also 5,6 -> 5,5.
    const placementCacheIdArr:string[] = [
      ...Object.values(newTempPlacedTiles).map(
        prevPlacement => `${prevPlacement.x},${prevPlacement.y},${prevPlacement.letter}`
      )
    ];
    placementCacheIdArr.sort();
    const placementCacheId = placementCacheIdArr.join('_');
    if (placementCache.hasOwnProperty(placementCacheId)) {
      return;
    }
    placementCache[placementCacheId] = true;

    const horizontalSequence = [placement];
    const verticalSequence = [placement];
    [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(i => {
      // find the horizontal and vertical sequence containing target square.
      let counter = 1;
      while (true) {
        const coordinateString = `${placement.x + i[0] * counter},${placement.y + i[1] * counter}`;
        const tile:Tile|null = placedTiles[coordinateString] || newTempPlacedTiles[coordinateString] || null;
        if (tile) {
          if (i[1] === 1) { // traveling down
            verticalSequence.push(tile);
          } else if (i[1] === -1) { // traveling up
            verticalSequence.unshift(tile);
          } else if (i[0] === 1) { // traveling right
            horizontalSequence.push(tile);
          } else if (i[0] === -1) { // traveling left
            horizontalSequence.unshift(tile);
          }
          counter++;
        } else { // if a blank (or edge of board) has been found, stop traveling in that direction.
          return; // return out of forEach() and continue with the next direction.
        }
      }
    });

    // if at least one sequence is invalid, stop processing this placement.
    let newHorizontalSequences = [...horizontalSequences];
    let newVerticalSequences = [...verticalSequences];
    if (
      invalidSequences.hasOwnProperty(horizontalSequence.map(i => i.letter).join(''))
      || invalidSequences.hasOwnProperty(verticalSequence.map(i => i.letter).join(''))
    ) {
      return; // proceed to next placement
    } else {
      // if all sequences are valid (but not necessarily actual words), record them.
      // placing a letter after the first will change a sequence that was previously formed.
      // so, depending on if the placement was horizontal or vertical, respective previous sequences need to be overwritten.
      let placementDirection:string = '';
      if (depth > 0) {
        const respectiveTile = Object.values(tempPlacedTiles)[0];
        placementDirection = respectiveTile.x === placement.x ? 'vertical' : 'horizontal';
        if (placementDirection === 'horizontal') {
          newHorizontalSequences = [];
        } else if (placementDirection === 'vertical') {
          newVerticalSequences = [];
        }
      }
      if (horizontalSequence.length > 1) {
        newHorizontalSequences.push(horizontalSequence);
      }
      if (verticalSequence.length > 1) {
        newVerticalSequences.push(verticalSequence);
      }
    }

    // if all sequences are valid scrabble words, record a possible "move".
    const combinedNewSequences = [...newHorizontalSequences, ...newVerticalSequences];
    if (!combinedNewSequences.filter(sequence => !sowpods.hasOwnProperty(sequence.map(i => i.letter).join(''))).length) {
      moves.push({
        placedTiles: newTempPlacedTiles,
        words: combinedNewSequences,
        score: generateMoveScore(combinedNewSequences)
      });
    }

    // add the next letter.
    const newTiles = [...tiles];
    newTiles.splice(newTiles.indexOf(placement.letter), 1);
    if (newTiles.length) {
      generateAIMoves(
        placedTiles,
        newTiles,
        newTempPlacedTiles,
        placementCache,
        newHorizontalSequences,
        newVerticalSequences,
        moves,
        depth + 1
      );
    }
  });
};

export const generateAIMove = (
  placedTiles:PlacedTiles, // map of all tiles on the board
  tiles:string[], // array of all tiles in ai's hand
) => {
  const timeStart = Date.now();

  const moves:moves = [];

  generateAIMoves(placedTiles, tiles, {}, {}, [], [], moves, 0);

  moves.sort((a, b) => b.score - a.score);

  const timeTaken = Date.now() - timeStart;

  const fancyDisplayResult = moves
    .map((i, index) => ({
      ...i,
      stringifiedWords: `${JSON.stringify(i.words.map(j => j.map(k => k.letter).join('')))}_${index}`
    })
  );
  console.log(`found ${moves.length} possible moves in ${timeTaken}ms`);
  console.log(`the best move is "${fancyDisplayResult[0].stringifiedWords}", scoring ${fancyDisplayResult[0].score}`);
  console.log(`all possible moves here:`, keyBy(fancyDisplayResult, 'stringifiedWords'));

  // return the top scoring move. this is not optimal from a competitive scrabble play point of view,
  // but adding any additional heuristics would be quite difficult and out of scope for my coding ability.
  return moves[0];
};
