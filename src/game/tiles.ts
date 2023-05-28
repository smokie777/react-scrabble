import { Tiles } from './types';

export const tiles:Tiles = [
  { letter: 'A', points: 1, count: 9 },
  { letter: 'B', points: 3, count: 2 },
  { letter: 'C', points: 3, count: 2 },
  { letter: 'D', points: 2, count: 3 },
  { letter: 'E', points: 1, count: 12 },
  { letter: 'F', points: 4, count: 2 },
  { letter: 'G', points: 2, count: 3 },
  { letter: 'H', points: 4, count: 2 },
  { letter: 'I', points: 1, count: 1 },
  { letter: 'J', points: 8, count: 1 },
  { letter: 'K', points: 5, count: 1 },
  { letter: 'L', points: 1, count: 4 },
  { letter: 'M', points: 3, count: 2 },
  { letter: 'N', points: 1, count: 6 },
  { letter: 'O', points: 1, count: 8 },
  { letter: 'P', points: 3, count: 2 },
  { letter: 'Q', points: 10, count: 1 },
  { letter: 'R', points: 1, count: 6 },
  { letter: 'S', points: 1, count: 4 },
  { letter: 'T', points: 1, count: 6 },
  { letter: 'U', points: 1, count: 4 },
  { letter: 'V', points: 4, count: 2 },
  { letter: 'W', points: 4, count: 2 },
  { letter: 'X', points: 8, count: 1 },
  { letter: 'Y', points: 4, count: 2 },
  { letter: 'Z', points: 10, count: 1 },
  { letter: 'BLANK', points: 0, count: 2 }
];

/*
English-language editions of Scrabble contain 100 letter tiles, in the following distribution:

2 blank tiles (scoring 0 points)
1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
2 points: D ×4, G ×3
3 points: B ×2, C ×2, M ×2, P ×2
4 points: F ×2, H ×2, V ×2, W ×2, Y ×2
5 points: K ×1
8 points: J ×1, X ×1
10 points: Q ×1, Z ×1
*/
