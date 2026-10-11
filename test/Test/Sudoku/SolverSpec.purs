module Test.Sudoku.SolverSpec (spec) where

import Prelude

import Data.Array (filter, length)
import Data.Array.NonEmpty (cons')
import Data.Foldable (all)
import Data.Maybe (isNothing)
import Sudoku.Grid (valueAt)
import Sudoku.Solver (SolveResult(..), solve)
import Sudoku.Types (Grid, positions)
import Test.QuickCheck (Result(..), (<?>), (===))
import Test.QuickCheck.Gen (chooseInt, oneOf)
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genContradiction, genPuzzle)
import Test.Sudoku.Rules (isValid)

-- | More steps than any search here takes.
plenty :: Int
plenty = top

spec :: Spec Unit
spec = describe "solve" do
  it "completes a puzzle into a valid grid" do
    quickCheck do
      puzzle <- genPuzzle
      pure case solve plenty puzzle of
        Solved g -> isValid g <?> "the grid is not valid"
        r -> Failed ("expected Solved, got " <> show r)
  it "keeps the filled cells" do
    quickCheck do
      puzzle <- genPuzzle
      pure case solve plenty puzzle of
        Solved g ->
          all
            ( \p -> isNothing (valueAt puzzle p) || valueAt g p == valueAt
                puzzle
                p
            )
            positions
            <?> "a filled cell changed"
        r -> Failed ("expected Solved, got " <> show r)
  it "reports a cell with no candidate as unsolvable" do
    quickCheck do
      puzzle <- genContradiction
      pure (solve plenty puzzle === Unsolvable)
  it "times out when the steps do not cover the empty cells" do
    quickCheck do
      puzzle <- genPuzzle
      let empty = emptyCells puzzle
      -- Half of the runs sit on the boundary, where an off-by-one would show.
      steps <- oneOf (cons' (pure empty) [ chooseInt 0 empty ])
      pure (solve steps puzzle === Timeout)

emptyCells :: Grid -> Int
emptyCells grid = length (filter (isNothing <<< valueAt grid) positions)
