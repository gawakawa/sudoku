module Test.Sudoku.Gen
  ( genEnum
  , genPosition
  , genCellValue
  , genGrid
  ) where

import Prelude

import Data.Array.NonEmpty (NonEmptyArray, cons')
import Data.Enum (class BoundedEnum, enumFromTo)
import Data.Maybe (Maybe(..))
import Sudoku.Types (Cell, CellValue, Grid, Position)
import Test.QuickCheck.Arbitrary (arbitrary)
import Test.QuickCheck.Gen (Gen, elements, oneOf, vectorOf)

genEnum :: forall @a. BoundedEnum a => Gen a
genEnum = elements (enumFromTo bottom top :: NonEmptyArray a)

genPosition :: Gen Position
genPosition = { row: _, col: _ } <$> genEnum <*> genEnum

genCellValue :: Gen CellValue
genCellValue = oneOf (cons' (pure Nothing) [ Just <$> genEnum ])

genCell :: Gen Cell
genCell = do
  value <- genCellValue
  isInitial <- arbitrary
  pure { value, isInitial }

genGrid :: Gen Grid
genGrid = vectorOf 9 (vectorOf 9 genCell)
