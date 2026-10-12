module Sudoku.Data.Puzzle
  ( Digit(..)
  , CellValue
  , Cell
  , Grid
  , initCell
  , initGrid
  , hasConflict
  , class Codec
  , encode
  , decode
  ) where

import Prelude

import Data.Array (any, find)
import Data.Enum (class BoundedEnum, class Enum, Cardinality(..), defaultPred, defaultSucc, enumFromTo, fromEnum, toEnum)
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Set as Set
import Data.Show.Generic (genericShow)
import Data.Traversable (traverse)
import Sudoku.Data.Board (Board, Position, getPeers, indices)

data Digit = D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9

derive instance Eq Digit
derive instance Ord Digit
derive instance Generic Digit _

instance Show Digit where
  show = genericShow

instance Bounded Digit where
  bottom = D1
  top = D9

instance Enum Digit where
  succ = defaultSucc toEnum fromEnum
  pred = defaultPred toEnum fromEnum

-- | `fromEnum` is the digit's own value: `fromEnum D5 == 5`.
instance BoundedEnum Digit where
  cardinality = Cardinality 9
  toEnum = case _ of
    1 -> Just D1
    2 -> Just D2
    3 -> Just D3
    4 -> Just D4
    5 -> Just D5
    6 -> Just D6
    7 -> Just D7
    8 -> Just D8
    9 -> Just D9
    _ -> Nothing
  fromEnum = case _ of
    D1 -> 1
    D2 -> 2
    D3 -> 3
    D4 -> 4
    D5 -> 5
    D6 -> 6
    D7 -> 7
    D8 -> 8
    D9 -> 9

type CellValue = Maybe Digit

type Cell = { value :: CellValue, isInitial :: Boolean }

type Grid = Board Cell

-- | A new empty cell on every call. A Solid store tracks state per object, so
-- | cells sharing one object would change together.
initCell :: Unit -> Cell
initCell _ = { value: Nothing, isInitial: false }

-- | A new empty grid on every call, for the same reason as `initCell`.
initGrid :: Unit -> Grid
initGrid _ = indices <#> \_ -> indices <#> \_ -> initCell unit

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

-- | Conversion between a value and the text shown in, or typed into, a cell.
class Codec a where
  encode :: a -> String
  decode :: String -> Maybe a

-- | `decode` accepts exactly the strings `encode` produces, so `"05"` and
-- | `"+5"` are rejected.
instance Codec Digit where
  encode = show <<< fromEnum
  decode s = find (\d -> encode d == s) (enumFromTo bottom top)
