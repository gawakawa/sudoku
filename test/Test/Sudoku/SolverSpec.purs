module Test.Sudoku.SolverSpec (spec) where

import Prelude

import Data.Either (Either(..))
import Sudoku.Solver (solve)
import Test.QuickCheck (Result(..), (<?>))
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBudget, genPuzzle, genUnsolvable)
import Test.Sudoku.Rules (isCompleteBoardOf)

-- | More budget than any search here needs.
plenty :: Int
plenty = top

spec :: Spec Unit
spec = describe "solve" do
  describe "soundness: a returned solution is a complete board of the puzzle" do
    it "holds for solvable puzzles" do
      quickCheck do
        puzzle <- genPuzzle
        budget <- genBudget
        pure case solve budget puzzle of
          Right grid ->
            isCompleteBoardOf puzzle grid
              <?> "the result is not a complete board of the puzzle"
          Left _ -> Success
    it "holds for unsolvable puzzles" do
      quickCheck do
        puzzle <- genUnsolvable
        budget <- genBudget
        pure case solve budget puzzle of
          Right grid ->
            isCompleteBoardOf puzzle grid
              <?> "the result is not a complete board of the puzzle"
          Left _ -> Success
  describe "completeness: a solvable puzzle gets a solution given enough budget"
    do
      it "holds for solvable puzzles" do
        quickCheck do
          puzzle <- genPuzzle
          pure case solve plenty puzzle of
            Right _ -> Success
            Left failure -> Failed ("expected a solution, got " <> show failure)
