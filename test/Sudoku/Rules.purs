-- | The rules of sudoku, written directly from their definition so that tests
-- | do not depend on the code they check.
module Test.Sudoku.Rules
  ( shareUnit
  , isValid
  , keepGiven
  , isCompleteBoardOf
  , valueAt
  ) where

import Prelude

import Data.Enum (fromEnum)
import Data.Foldable (all)
import Data.Maybe (isJust, isNothing)
import Sudoku.Data.Board (Position, cellAt, positions)
import Sudoku.Data.Puzzle (CellValue, Grid)

-- | The value of the cell at a position, if it is on the board and filled.
valueAt :: Grid -> Position -> CellValue
valueAt grid pos = cellAt grid pos >>= _.value

shareUnit :: Position -> Position -> Boolean
shareUnit a b =
  a.row == b.row
    || a.col == b.col
    || (block a.row == block b.row && block a.col == block b.col)
  where
  block i = fromEnum i / 3

-- | Every cell is filled, and no two cells in a row, column or block agree.
isValid :: Grid -> Boolean
isValid grid = all ok positions
  where
  ok p = isJust (valueAt grid p) && all (agreeable p) positions
  agreeable p q = p == q || not (shareUnit p q) || valueAt grid p /= valueAt
    grid
    q

-- | Every digit `puzzle` gives is kept in `grid`.
keepGiven :: Grid -> Grid -> Boolean
keepGiven puzzle grid = all keep positions
  where
  keep p = isNothing (valueAt puzzle p) || valueAt grid p == valueAt puzzle p

-- | Whether `grid` is a complete board of `puzzle`.
isCompleteBoardOf :: Grid -> Grid -> Boolean
isCompleteBoardOf puzzle grid = isValid grid && keepGiven puzzle grid
