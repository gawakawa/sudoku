module Sudoku.Types
  ( Digit(..)
  , Index(..)
  , Position(..)
  , CellValue
  , Cell
  , Grid
  , indices
  , blockOf
  , class Codec
  , encode
  , decode
  ) where

import Prelude

import Data.Array (find)
import Data.Enum (class BoundedEnum, class Enum, Cardinality(..), defaultPred, defaultSucc, enumFromTo, fromEnum, toEnum)
import Data.Generic.Rep (class Generic)
import Data.Maybe (Maybe(..))
import Data.Show.Generic (genericShow)

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

newtype Position = Position { row :: Index, col :: Index }

derive newtype instance Eq Position
derive newtype instance Ord Position
derive newtype instance Show Position

instance Bounded Position where
  bottom = Position { row: bottom, col: bottom }
  top = Position { row: top, col: top }

instance Enum Position where
  succ = defaultSucc toEnum fromEnum
  pred = defaultPred toEnum fromEnum

-- | `fromEnum` is the cell id: `row * 9 + col`, in 0..80.
instance BoundedEnum Position where
  cardinality = Cardinality 81
  toEnum n
    | n >= 0 && n < 81 = do
        row <- toEnum (n / 9)
        col <- toEnum (n `mod` 9)
        Just (Position { row, col })
    | otherwise = Nothing
  fromEnum (Position { row, col }) = fromEnum row * 9 + fromEnum col

type CellValue = Maybe Digit

type Cell = { value :: CellValue, isInitial :: Boolean }

-- | Indexed with `Array.index` by `fromEnum` of a row and a column.
type Grid = Array (Array Cell)

indices :: Array Index
indices = enumFromTo bottom top

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

-- | Conversion between a value and the text shown in, or typed into, a cell.
class Codec a where
  encode :: a -> String
  decode :: String -> Maybe a

instance Codec Digit where
  encode = encodeEnum
  decode = decodeEnum encodeEnum

instance Codec Index where
  encode = encodeEnum
  decode = decodeEnum encodeEnum

encodeEnum :: forall a. BoundedEnum a => a -> String
encodeEnum = show <<< fromEnum

-- | Accepts exactly the strings `encode` produces, so `"05"` and `"+5"` are
-- | rejected.
decodeEnum :: forall a. BoundedEnum a => (a -> String) -> String -> Maybe a
decodeEnum encode' s = find (\x -> encode' x == s) (enumFromTo bottom top)
