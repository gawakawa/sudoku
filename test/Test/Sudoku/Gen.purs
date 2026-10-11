module Test.Sudoku.Gen
  ( genEnum
  , genPosition
  , genCellValue
  , genGrid
  , genPuzzle
  , genConflict
  ) where

import Prelude

import Data.Array (drop, take)
import Data.Array.NonEmpty (NonEmptyArray, cons')
import Data.Enum (class BoundedEnum, enumFromTo, fromEnum)
import Data.Maybe (Maybe(..))
import Data.Traversable (traverse)
import Sudoku.Grid (initCell, setValue, valueAt)
import Sudoku.Types (Cell, CellValue, Digit, Grid, Position, indices)
import Test.QuickCheck.Arbitrary (arbitrary)
import Test.QuickCheck.Gen (Gen, elements, oneOf, suchThat, vectorOf)
import Test.Sudoku.Rules (sharesUnit)

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

-- | A complete valid grid: each row is the digits rotated, by 3 more per row
-- | within a band and by 1 more per band.
solution :: Grid
solution = indices <#> \row ->
  let
    shift = 3 * (fromEnum row `mod` 3) + fromEnum row / 3
    digits = enumFromTo bottom top :: Array Digit
  in
    (drop shift digits <> take shift digits) <#> \d ->
      { value: Just d, isInitial: true }

-- | A valid grid with random cells emptied, so it is known to be solvable.
genPuzzle :: Gen Grid
genPuzzle = traverse (traverse keepOrEmpty) solution
  where
  keepOrEmpty cell = arbitrary <#> if _ then cell else initCell

-- | A puzzle in which two cells that share a row, column or block are given
-- | the same digit.
genConflict :: Gen Grid
genConflict = do
  p <- genPosition
  q <- genPosition `suchThat` \q -> q /= p && sharesUnit p q
  puzzle <- genPuzzle
  let digit = valueAt solution p
  pure (setValue p digit (setValue q digit puzzle))
