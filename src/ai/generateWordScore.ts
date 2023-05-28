import { board } from '../game/board';
import { Tile } from '../game/types';

export const generateWordScore = (word:Tile[]) => {
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
  return baseWordScore;
};

export const generateMovesScore = (words:Tile[][]) => words
  .map(word => generateWordScore(word))
  .reduce((acc, score) => acc + score);
  