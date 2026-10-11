module Sudoku.Types
  ( Digit
  , digits
  , fromInt
  , toInt
  , CellValue
  , Cell
  , Position
  , Grid
  , ErrorGrid
  , indices
  ) where

import Prelude

import Data.Array (range)
import Data.Maybe (Maybe(..))

newtype Digit = Digit Int

derive newtype instance Eq Digit
derive newtype instance Ord Digit
derive newtype instance Show Digit

digits :: Array Digit
digits = map Digit (range 1 9)

fromInt :: Int -> Maybe Digit
fromInt n
  | n >= 1 && n <= 9 = Just (Digit n)
  | otherwise = Nothing

toInt :: Digit -> Int
toInt (Digit n) = n

type CellValue = Maybe Digit

type Cell = { value :: CellValue, isInitial :: Boolean }

type Position = { row :: Int, col :: Int }

-- | Indexed as `grid !! row >>= (_ !! col)`.
type Grid = Array (Array Cell)

type ErrorGrid = Array (Array Boolean)

indices :: Array Int
indices = range 0 8
