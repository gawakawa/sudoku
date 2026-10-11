module Test.Sudoku.SolverSpec (spec) where

import Prelude

import Data.Either (Either(..))
import Data.Foldable (all)
import Data.Maybe (isNothing)
import Sudoku.Grid (valueAt)
import Sudoku.Solver (Failure(..), solve)
import Sudoku.Types (positions)
import Test.QuickCheck (Result(..), (<?>), (===))
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genConflict, genPuzzle)
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
        Right g -> isValid g <?> "the grid is not valid"
        Left f -> Failed ("expected a solution, got " <> show f)
  it "keeps the filled cells" do
    quickCheck do
      puzzle <- genPuzzle
      pure case solve plenty puzzle of
        Right g ->
          all
            ( \p -> isNothing (valueAt puzzle p) || valueAt g p == valueAt
                puzzle
                p
            )
            positions
            <?> "a filled cell changed"
        Left f -> Failed ("expected a solution, got " <> show f)
  it "reports a repeated given digit as unsolvable" do
    quickCheck do
      puzzle <- genConflict
      pure (solve plenty puzzle === Left NoSolution)
