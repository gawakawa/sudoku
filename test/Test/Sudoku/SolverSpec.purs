module Test.Sudoku.SolverSpec (spec) where

import Prelude

import Data.Either (Either(..))
import Sudoku.Solver (solve)
import Sudoku.Types (Grid)
import Test.QuickCheck (Result(..), (<?>))
import Test.QuickCheck.Gen (Gen)
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBudget, genPuzzle, genUnsolvable)
import Test.Sudoku.Rules (isCompleteBoardOf)

-- | More budget than any search here needs.
plenty :: Int
plenty = top

-- | Whenever `solve` returns a solution, it is a complete board of the puzzle.
-- | A run that returns none has nothing to check.
soundness :: Gen Grid -> Gen Result
soundness genInput = do
  puzzle <- genInput
  budget <- genBudget
  pure case solve budget puzzle of
    Right grid ->
      isCompleteBoardOf puzzle grid
        <?> "the result is not a complete board of the puzzle"
    Left _ -> Success

spec :: Spec Unit
spec = describe "solve" do
  describe "soundness: a returned solution is a complete board of the puzzle" do
    it "holds for solvable puzzles" do
      quickCheck (soundness genPuzzle)
    it "holds for unsolvable puzzles" do
      quickCheck (soundness genUnsolvable)
  describe "completeness" do
    it "returns a solution for every solvable puzzle given enough budget" do
      quickCheck do
        puzzle <- genPuzzle
        pure case solve plenty puzzle of
          Right _ -> Success
          Left failure -> Failed ("expected a solution, got " <> show failure)
