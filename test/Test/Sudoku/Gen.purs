module Test.Sudoku.Gen
  ( genEnum
  , genPosition
  , genCellValue
  , genGrid
  , genPuzzle
  , genConflict
  , genNoCandidate
  , genDeadEnd
  , genUnsolvable
  , genBoard
  , genBudget
  , genDiagonal
  , genPositions
  ) where

import Prelude

import Data.Array (drop, filter, filterA, take, zip)
import Data.Array.NonEmpty (NonEmptyArray, cons')
import Data.Enum (class BoundedEnum, enumFromTo, fromEnum)
import Data.Foldable (foldl)
import Data.Maybe (Maybe(..))
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..))
import Sudoku.Grid (initCell, initGrid, setValue, valueAt)
import Sudoku.Types (Cell, CellValue, Digit, Grid, Position, indices, positions)
import Test.QuickCheck.Arbitrary (arbitrary)
import Test.QuickCheck.Gen (Gen, chooseInt, elements, oneOf, shuffle, suchThat, vectorOf)
import Test.Sudoku.Rules (shareUnit)

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

allDigits :: Array Digit
allDigits = enumFromTo bottom top

-- | A complete valid grid: each row is the digits rotated, by 3 more per row
-- | within a band and by 1 more per band.
solution :: Grid
solution = indices <#> \row ->
  let
    shift = 3 * (fromEnum row `mod` 3) + fromEnum row / 3
  in
    (drop shift allDigits <> take shift allDigits) <#> \d ->
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
  q <- genPosition `suchThat` \q -> q /= p && shareUnit p q
  puzzle <- genPuzzle
  let digit = valueAt solution p
  pure (setValue p digit (setValue q digit puzzle))

-- | A board with only the given cells filled.
fromCells :: Array (Tuple Position Digit) -> Grid
fromCells = foldl
  (\grid (Tuple pos digit) -> setValue pos (Just digit) grid)
  initGrid

-- | A cell that sees eight digits in its row and the ninth in its column, so
-- | no digit can go there although no digit is repeated.
genNoCandidate :: Gen Grid
genNoCandidate = do
  p <- genPosition
  missing <- genEnum @Digit
  rowDigits <- shuffle (filter (_ /= missing) allDigits)
  seenIn <- genEnum `suchThat` (_ /= p.row)
  let
    rowCells = zip
      (filter (_ /= p.col) indices <#> \col -> { row: p.row, col })
      rowDigits
  pure (fromCells (rowCells <> [ Tuple { row: seenIn, col: p.col } missing ]))

-- | Two cells of a row that can only hold the same digit `y`. The other seven
-- | cells of the row are given, and each of the two cells sees the remaining
-- | digit `x` in its column. Every empty cell has a candidate and no digit is
-- | repeated, yet the board has no solution.
genDeadEnd :: Gen Grid
genDeadEnd = do
  row <- genEnum
  c1 <- genEnum
  c2 <- genEnum `suchThat` (_ /= c1)
  x <- genEnum
  y <- genEnum `suchThat` (_ /= x)
  rowDigits <- shuffle (filter (\d -> d /= x && d /= y) allDigits)
  r1 <- genEnum `suchThat` (_ /= row)
  r2 <- genEnum `suchThat` \r -> r /= row && band r /= band r1
  let
    rowCells = zip
      (filter (\c -> c /= c1 && c /= c2) indices <#> \col -> { row, col })
      rowDigits
  pure
    ( fromCells
        ( rowCells <>
            [ Tuple { row: r1, col: c1 } x, Tuple { row: r2, col: c2 } x ]
        )
    )
  where
  band r = fromEnum r / 3

-- | A board without a solution, of each of the three kinds above.
genUnsolvable :: Gen Grid
genUnsolvable = oneOf (cons' genConflict [ genNoCandidate, genDeadEnd ])

-- | A board that may or may not have a solution.
genBoard :: Gen Grid
genBoard = oneOf (cons' genPuzzle [ genUnsolvable ])

-- | A budget that is small as often as it is large.
genBudget :: Gen Int
genBudget = oneOf (cons' (chooseInt 0 200) [ chooseInt 0 1000000 ])

-- | Digits for the three diagonal blocks, each block a permutation.
genDiagonal :: Gen (Array (Array Digit))
genDiagonal = vectorOf 3 (shuffle allDigits)

-- | Any subset of the 81 positions.
genPositions :: Gen (Array Position)
genPositions = filterA (\_ -> arbitrary) positions
