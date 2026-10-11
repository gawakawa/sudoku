module Sudoku.Grid
  ( initCell
  , initGrid
  , cellAt
  , valueAt
  , getPeers
  , calculateCellError
  , setValue
  , peerErrors
  ) where

import Prelude

import Data.Array (any, index, mapWithIndex)
import Data.Enum (fromEnum)
import Data.Maybe (Maybe(..))
import Data.Set (Set)
import Data.Set as Set
import Sudoku.Types (Cell, CellValue, Grid, Position(..), blockOf, indices)

initCell :: Cell
initCell = { value: Nothing, isInitial: false }

initGrid :: Grid
initGrid = indices <#> \_ -> indices <#> \_ -> initCell

cellAt :: Grid -> Position -> Maybe Cell
cellAt grid (Position { row, col }) =
  index grid (fromEnum row) >>= \cells -> index cells (fromEnum col)

valueAt :: Grid -> Position -> CellValue
valueAt grid pos = cellAt grid pos >>= _.value

-- | The 21 positions sharing a row, column or block with `pos`, `pos` included.
getPeers :: Position -> Set Position
getPeers (Position { row, col }) =
  Set.fromFoldable (rowPeers <> colPeers <> blockPeers)
  where
  rowPeers = indices <#> \c -> Position { row, col: c }
  colPeers = indices <#> \r -> Position { row: r, col }
  blockPeers = do
    r <- blockOf row
    c <- blockOf col
    pure (Position { row: r, col: c })

-- | Whether another cell in the row, column or block holds the same value.
calculateCellError :: Grid -> Position -> Boolean
calculateCellError grid pos = case valueAt grid pos of
  Nothing -> false
  value -> any (\p -> p /= pos && valueAt grid p == value)
    (Set.toUnfoldable (getPeers pos))

setValue :: Position -> CellValue -> Grid -> Grid
setValue (Position p) value = mapWithIndex \r -> mapWithIndex \c cell ->
  if r == fromEnum p.row && c == fromEnum p.col then cell { value = value }
  else cell

-- | Error state of every peer of `pos`, computed from `grid` alone. Solid 2.0
-- | batches store writes, so callers pass the next grid instead of reading the
-- | store back.
peerErrors :: Grid -> Position -> Array { pos :: Position, hasError :: Boolean }
peerErrors grid pos =
  Set.toUnfoldable (getPeers pos) <#> \p ->
    { pos: p, hasError: calculateCellError grid p }
