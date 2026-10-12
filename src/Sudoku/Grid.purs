module Sudoku.Grid
  ( initCell
  , initGrid
  , cellAt
  , valueAt
  , getPeers
  , hasConflict
  , modifyCell
  , setValue
  ) where

import Prelude

import Data.Array (any, index, mapWithIndex)
import Data.Enum (fromEnum)
import Data.Maybe (Maybe(..))
import Data.Set (Set)
import Data.Set as Set
import Data.Traversable (traverse)
import Sudoku.Types (Board, Cell, CellValue, Grid, Position, blockOf, indices)

-- | A new empty cell on every call. A Solid store tracks state per object, so
-- | cells sharing one object would change together.
initCell :: Unit -> Cell
initCell _ = { value: Nothing, isInitial: false }

-- | A new empty grid on every call, for the same reason as `initCell`.
initGrid :: Unit -> Grid
initGrid _ = indices <#> \_ -> indices <#> \_ -> initCell unit

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
-- | `m` is how a value is read, so a reactive caller tracks only the cells it
-- | reads: an empty cell reads no peer.
hasConflict
  :: forall m. Monad m => (Position -> m CellValue) -> Position -> m Boolean
hasConflict valueOf pos = valueOf pos >>= case _ of
  Nothing -> pure false
  value -> do
    peers <- traverse valueOf
      (Set.toUnfoldable (Set.delete pos (getPeers pos)) :: Array Position)
    pure (any (_ == value) peers)

modifyCell :: forall a. Position -> (a -> a) -> Board a -> Board a
modifyCell p f = mapWithIndex \r -> mapWithIndex \c cell ->
  if r == fromEnum p.row && c == fromEnum p.col then f cell
  else cell

setValue :: Position -> CellValue -> Grid -> Grid
setValue p value = modifyCell p _ { value = value }
