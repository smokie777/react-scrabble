import { tileMap } from '../game/tiles';
import { uniq } from 'lodash';
import { PlacedTiles, Tile } from '../game/types';
import { twl06 } from '../game/twl06';
import { twl06InvalidSequences } from '../game/twl06InvalidSequences';
import { keyBy } from 'lodash';
import { generateMovesScore } from './generateWordScore';

const maxAITurnTime = 1000; // ms
const directionMatrix = [[0, 1], [0, -1], [1, 0], [-1, 0]];

const generatePlacementCacheId = (placements:Tile[]) => {
  const placementCacheIdArr:string[] = placements.map(i => `${i.x},${i.y},${i.letter}`);
  placementCacheIdArr.sort();
  return placementCacheIdArr.join('_');
};

type moves = Array<{
  placedTiles:PlacedTiles, // board state
  words:Tile[][], // all words created by the move
  score:number, // total score of move
  remainingTiles:string[] // what tiles AI has left after the move
}>
const generateAIMoves = (
  placedTiles:PlacedTiles, // map of all tiles on the board
  tiles:string[], // array of all tiles in ai's hand
  tempPlacedTiles:PlacedTiles, // map of all temp tile placements for move calculation
  placementCache:{[key:string]:boolean}, // cache of all already-explored placements to prevent dupes
  horizontalSequences:Tile[][], // all horizontal sequences generated so far
  verticalSequences:Tile[][], // all vertical sequences generated so far
  moves:moves, // array of all possible moves. populated by this function.
  timeStart:number, // time first function call started in ms
  depth:number, // recursion depth, aka how many letters can the AI play at once.
  perfMetrics:{[key:string]:any} // performance metrics for development purposes only
) => {
  perfMetrics.depthsIterated[depth]++;
  perfMetrics.timesGenerateAIMovesCalled++;

  // create an array "placements", of all possible ways to place one letter
  const tilesDeduped:string[] = uniq(tiles);
  const placements:Tile[] = [];
  if (depth === 0) {
    // the first letter can be placed anywhere adjacent to a pre-existing placed letter.
    Object.values(placedTiles).forEach(placedTile => {
      directionMatrix.forEach(i => {
        const coordinateString = `${placedTile.x + i[0]},${placedTile.y + i[1]}`;
        if (
          placedTile.x + i[0] >= 0 && placedTile.x + i[0] <= 14
          && placedTile.y + i[1] >= 0 && placedTile.y + i[1] <= 14
          && !placedTiles.hasOwnProperty(coordinateString)
          && !tempPlacedTiles.hasOwnProperty(coordinateString)
        ) {
          tilesDeduped.forEach(tile => {
            placements.push({
              ...tileMap[tile],
              x: placedTile.x + i[0],
              y: placedTile.y + i[1]
            });
          });
        }
      })
    });
  } else if (depth >= 1) {
    const possibleDirections = depth === 1
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
          // if empty square is found, add placements, then proceed to the next direction.
          // eslint-disable-next-line no-loop-func
          tilesDeduped.forEach(tile => {
            placements.push({
              ...tileMap[tile],
              x: startTile.x + i[0] * counter,
              y: startTile.y + i[1] * counter
            });
          });
          return;
        } else {
          // if non-empty, in-bounds square is found, keep searching in that direction.
          counter++;
        }
      }
    });
  }

  // iterate through all placements, and process horizontal and vertical sequence created by that placement
  placements.forEach(placement => {
    perfMetrics.placementsTotalAttempted++;

    const newTempPlacedTiles = { ...tempPlacedTiles };
    newTempPlacedTiles[`${placement.x},${placement.y}`] = placement;
    // cache a unique id based on placement coordinates and letter to prevent duplicate iterations
    // such as iterating on 5,5 -> 5,6, and also 5,6 -> 5,5.
    const placementCacheId = generatePlacementCacheId(Object.values(newTempPlacedTiles));
    if (placementCache.hasOwnProperty(placementCacheId)) {
      perfMetrics.placementsSkippedDueToCaching++;
      return;
    }
    placementCache[placementCacheId] = true;

    const horizontalSequence = [placement];
    const verticalSequence = [placement];
    directionMatrix.forEach(i => {
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
        } else { // if an empty tile (or edge of board) has been found, stop traveling in that direction.
          return; // return out of forEach() and continue with the next direction.
        }
      }
    });

    // if at least one sequence is invalid, stop processing this placement.
    let newHorizontalSequences = [...horizontalSequences];
    let newVerticalSequences = [...verticalSequences];
    if (
      twl06InvalidSequences.hasOwnProperty(horizontalSequence.map(i => i.letter).join(''))
      || twl06InvalidSequences.hasOwnProperty(verticalSequence.map(i => i.letter).join(''))
    ) {
      perfMetrics.placementsTerminatedDueToInvalidSequence++;
      return; // proceed to next placement
    } else {
      // if all sequences are valid (but not necessarily actual words), record them.
      // placing a letter after the first will change a sequence that was previously formed.
      // so, depending on if the placement was horizontal or vertical, respective previous sequences need to be overwritten.
      if (depth > 0) {
        if (Object.values(tempPlacedTiles)[0].x === placement.x) {
          // placement is vertical
          newVerticalSequences = [];
        } else {
          // placement is horizontal
          newHorizontalSequences = [];
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
    const newTiles = [...tiles];
    newTiles.splice(newTiles.indexOf(placement.letter), 1);
    const combinedNewSequences = [...newHorizontalSequences, ...newVerticalSequences];
    if (!combinedNewSequences.filter(sequence => !twl06.hasOwnProperty(sequence.map(i => i.letter).join(''))).length) {
      moves.push({
        placedTiles: newTempPlacedTiles,
        words: combinedNewSequences,
        score: generateMovesScore(combinedNewSequences),
        remainingTiles: newTiles
      });
    }

    // add the next letter.
    perfMetrics.placementsFullyProcessed++;
    if (newTiles.length && Date.now() - timeStart < maxAITurnTime) {
      generateAIMoves(
        placedTiles,
        newTiles,
        newTempPlacedTiles,
        placementCache,
        newHorizontalSequences,
        newVerticalSequences,
        moves,
        timeStart,
        depth + 1,
        perfMetrics
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
  const perfMetrics:{[key:string]:any} = {
    placementsTotalAttempted: 0,
    placementsSkippedDueToCaching: 0,
    placementsTerminatedDueToInvalidSequence: 0,
    placementsFullyProcessed: 0,
    timesGenerateAIMovesCalled: 0,
    depthsIterated: [0, 0, 0, 0, 0, 0, 0]
  };

  generateAIMoves(placedTiles, tiles, {}, {}, [], [], moves, timeStart, 0, perfMetrics);

  moves.sort((a, b) => b.score - a.score);

  const timeTaken = Date.now() - timeStart;

  const fancyDisplayResult = moves
    .map((i, index) => ({
      ...i,
      stringifiedWords: `${JSON.stringify(i.words.map(j => j.map(k => k.letter).join('')))}_${index}`
    })
  );
  console.log(`found ${moves.length} possible moves in ${timeTaken}ms`);
  if (moves.length) {
    console.log(`the best move is "${fancyDisplayResult[0].stringifiedWords}", scoring ${fancyDisplayResult[0].score}`);
  }
  console.log(`perfMetrics: `, perfMetrics)
  console.log(`all possible moves here:`, keyBy(fancyDisplayResult, 'stringifiedWords'));

  // return the top scoring move. this is not optimal from a competitive scrabble play point of view,
  // but adding any additional heuristics would be quite difficult and out of scope for my coding ability.
  return moves[0];
};
