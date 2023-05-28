export interface Tile {
  letter: string;
  points: number;
  count: number;
}

export type Tiles = Tile[];

export interface Square {
  text: string;
  letterScoreModifier: number;
  wordScoreModifier: number;
  x: number;
  y: number;
  color: string;
}
export type SquareRow = Square[];
export type Board = SquareRow[];
export interface SquareCoordinateMap {
  [key:string]: Square
}
