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

import Data.Array (any, index, mapWithIndex, range)
import Data.Maybe (Maybe(..))
import Data.Set (Set)
import Data.Set as Set
import Sudoku.Types (Cell, CellValue, Grid, Position, indices)

initCell :: Cell
initCell = { value: Nothing, isInitial: false }

initGrid :: Grid
initGrid = indices <#> \_ -> indices <#> \_ -> initCell

cellAt :: Grid -> Position -> Maybe Cell
cellAt grid pos = index grid pos.row >>= \row -> index row pos.col

valueAt :: Grid -> Position -> CellValue
valueAt grid pos = cellAt grid pos >>= _.value

-- | The 21 positions sharing a row, column or block with `pos`, `pos` included.
getPeers :: Position -> Set Position
getPeers pos = Set.fromFoldable (rowPeers <> colPeers <> blockPeers)
  where
  rowPeers = indices <#> \col -> { row: pos.row, col }
  colPeers = indices <#> \row -> { row, col: pos.col }
  blockRow = pos.row / 3 * 3
  blockCol = pos.col / 3 * 3
  blockPeers = do
    dr <- range 0 2
    dc <- range 0 2
    pure { row: blockRow + dr, col: blockCol + dc }

-- | Whether another cell in the row, column or block holds the same value.
calculateCellError :: Grid -> Position -> Boolean
calculateCellError grid pos = case valueAt grid pos of
  Nothing -> false
  value -> any (\p -> p /= pos && valueAt grid p == value)
    (Set.toUnfoldable (getPeers pos))

setValue :: Position -> CellValue -> Grid -> Grid
setValue pos value = mapWithIndex \r -> mapWithIndex \c cell ->
  if r == pos.row && c == pos.col then cell { value = value } else cell

-- | Error state of every peer of `pos`, computed from `grid` alone. Solid 2.0
-- | batches store writes, so callers pass the next grid instead of reading the
-- | store back.
peerErrors :: Grid -> Position -> Array { pos :: Position, hasError :: Boolean }
peerErrors grid pos =
  Set.toUnfoldable (getPeers pos) <#> \p ->
    { pos: p, hasError: calculateCellError grid p }
