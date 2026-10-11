module Sudoku.Grid
  ( initCell
  , initGrid
  , cellAt
  , valueAt
  , getPeers
  , calculateCellError
  , modifyCell
  , setValue
  , peerErrors
  ) where

import Prelude

import Data.Array (any, index, mapWithIndex)
import Data.Enum (fromEnum)
import Data.Maybe (Maybe(..))
import Data.Set (Set)
import Data.Set as Set
import Sudoku.Types (Board, Cell, CellValue, Grid, Position, blockOf, indices)

initCell :: Cell
initCell = { value: Nothing, isInitial: false }

initGrid :: Grid
initGrid = indices <#> \_ -> indices <#> \_ -> initCell

cellAt :: forall a. Board a -> Position -> Maybe a
cellAt board { row, col } =
  index board (fromEnum row) >>= \cells -> index cells (fromEnum col)

valueAt :: Grid -> Position -> CellValue
valueAt grid pos = cellAt grid pos >>= _.value

-- | The 21 positions sharing a row, column or block with `pos`, `pos` included.
getPeers :: Position -> Set Position
getPeers { row, col } =
  Set.fromFoldable (rowPeers <> colPeers <> blockPeers)
  where
  rowPeers = indices <#> \c -> { row, col: c }
  colPeers = indices <#> \r -> { row: r, col }
  blockPeers = do
    r <- blockOf row
    c <- blockOf col
    pure { row: r, col: c }

-- | Whether another cell in the row, column or block holds the same value.
calculateCellError :: Grid -> Position -> Boolean
calculateCellError grid pos = case valueAt grid pos of
  Nothing -> false
  value -> any (\p -> p /= pos && valueAt grid p == value)
    (Set.toUnfoldable (getPeers pos))

modifyCell :: forall a. Position -> (a -> a) -> Board a -> Board a
modifyCell p f = mapWithIndex \r -> mapWithIndex \c cell ->
  if r == fromEnum p.row && c == fromEnum p.col then f cell
  else cell

setValue :: Position -> CellValue -> Grid -> Grid
setValue p value = modifyCell p _ { value = value }

-- | Error state of every peer of `pos`, computed from `grid` alone. Solid 2.0
-- | batches store writes, so callers pass the next grid instead of reading the
-- | store back.
peerErrors :: Grid -> Position -> Array { pos :: Position, hasError :: Boolean }
peerErrors grid pos =
  Set.toUnfoldable (getPeers pos) <#> \p ->
    { pos: p, hasError: calculateCellError grid p }
