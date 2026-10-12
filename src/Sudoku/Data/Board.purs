module Sudoku.Data.Board
  ( Index(..)
  , Position
  , Board
  , indices
  , positions
  , blockOf
  , cellAt
  , modifyCell
  , getPeers
  ) where

import Prelude

import Data.Array (index, mapWithIndex)
import Data.Enum (class BoundedEnum, class Enum, Cardinality(..), defaultPred, defaultSucc, enumFromTo, fromEnum, toEnum)
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Set (Set)
import Data.Set as Set
import Data.Show.Generic (genericShow)

-- | A row or column index.
data Index = I0 | I1 | I2 | I3 | I4 | I5 | I6 | I7 | I8

derive instance Eq Index
derive instance Ord Index
derive instance Generic Index _

instance Show Index where
  show = genericShow

instance Bounded Index where
  bottom = I0
  top = I8

instance Enum Index where
  succ = defaultSucc toEnum fromEnum
  pred = defaultPred toEnum fromEnum

instance BoundedEnum Index where
  cardinality = Cardinality 9
  toEnum = case _ of
    0 -> Just I0
    1 -> Just I1
    2 -> Just I2
    3 -> Just I3
    4 -> Just I4
    5 -> Just I5
    6 -> Just I6
    7 -> Just I7
    8 -> Just I8
    _ -> Nothing
  fromEnum = case _ of
    I0 -> 0
    I1 -> 1
    I2 -> 2
    I3 -> 3
    I4 -> 4
    I5 -> 5
    I6 -> 6
    I7 -> 7
    I8 -> 8

type Position = { row :: Index, col :: Index }

-- | Nine rows of nine cells, indexed with `Array.index` by `fromEnum` of a row
-- | and a column.
type Board a = Array (Array a)

indices :: Array Index
indices = enumFromTo bottom top

-- | All 81 positions, row by row.
positions :: Array Position
positions = do
  row <- indices
  col <- indices
  pure { row, col }

-- | The three indices of the 3x3 block containing the given index.
blockOf :: Index -> Array Index
blockOf = case _ of
  I0 -> [ I0, I1, I2 ]
  I1 -> [ I0, I1, I2 ]
  I2 -> [ I0, I1, I2 ]
  I3 -> [ I3, I4, I5 ]
  I4 -> [ I3, I4, I5 ]
  I5 -> [ I3, I4, I5 ]
  I6 -> [ I6, I7, I8 ]
  I7 -> [ I6, I7, I8 ]
  I8 -> [ I6, I7, I8 ]

cellAt :: forall a. Board a -> Position -> Maybe a
cellAt board { row, col } =
  index board (fromEnum row) >>= \cells -> index cells (fromEnum col)

modifyCell :: forall a. Position -> (a -> a) -> Board a -> Board a
modifyCell p f = mapWithIndex \r -> mapWithIndex \c cell ->
  if r == fromEnum p.row && c == fromEnum p.col then f cell
  else cell

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
