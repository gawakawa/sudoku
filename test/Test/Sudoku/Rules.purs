-- | The rules of sudoku, written directly from their definition so that tests
-- | do not depend on the code they check.
module Test.Sudoku.Rules
  ( sharesUnit
  , isValid
  ) where

import Prelude

import Data.Enum (fromEnum)
import Data.Foldable (all)
import Data.Maybe (isJust)
import Sudoku.Grid (valueAt)
import Sudoku.Types (Grid, Position, positions)

sharesUnit :: Position -> Position -> Boolean
sharesUnit a b =
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
  agreeable p q = p == q || not (sharesUnit p q) || valueAt grid p /= valueAt
    grid
    q
