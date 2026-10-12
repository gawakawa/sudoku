module Test.Sudoku.Solver.InternalSpec (spec) where

import Prelude

import Data.List.Lazy (nil)
import Sudoku.Grid (initGrid)
import Sudoku.Solver.Internal (Next(..), Searching(..), budget, start, step)
import Test.QuickCheck (Result(..))
import Test.QuickCheck.Gen (suchThat)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBoard, genBudget)

-- | A searching state with no budget left ends on the next transition.
endNext :: Searching -> Boolean
endNext s = case step s of
  Continue _ -> false
  _ -> true

spec :: Spec Unit
spec = describe "the state machine ends in a finite number of transitions" do
  it "every transition back to searching consumes budget" do
    quickCheck do
      board <- genBoard
      spendable <- genBudget `suchThat` (_ > 0)
      let
        -- Every searching state on the run that has budget left.
        check s
          | budget s <= 0 = Success
          | otherwise = case step s of
              Continue s'
                | budget s' < budget s -> check s'
                | otherwise -> Failed
                    ( "budget went from " <> show (budget s) <> " to "
                        <> show (budget s')
                    )
              _ -> Success
      pure (check (start spendable board))
  describe "a searching state with budget 0 or less ends on the next transition"
    do
      describe "when choices remain" do
        it "with budget 0" do
          let budget = 0
          endNext (start budget (initGrid unit)) `shouldEqual` true
        it "with a negative budget" do
          let budget = -1
          endNext (start budget (initGrid unit)) `shouldEqual` true
      describe "when no choices remain" do
        it "with budget 0" do
          let budget = 0
          endNext (Searching { pending: nil, budget }) `shouldEqual` true
        it "with a negative budget" do
          let budget = -1
          endNext (Searching { pending: nil, budget }) `shouldEqual` true
