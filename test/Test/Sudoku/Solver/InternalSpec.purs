module Test.Sudoku.Solver.InternalSpec (spec) where

import Prelude

import Data.List.Lazy (nil)
import Sudoku.Solver.Internal (Next(..), Searching(..), budget, hasChoices, start, step)
import Test.QuickCheck (Result(..))
import Test.QuickCheck.Gen (chooseInt, suchThat)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (fail)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBoard, genBudget)

name :: Next -> String
name = case _ of
  Continue _ -> "searching"
  Finish _ -> "solved"
  Expire _ -> "timeout"
  Exhaust _ -> "unsolvable"

-- | A searching state with no budget left ends on the next transition: in the
-- | unsolvable state if no choices remain, in the timeout state otherwise.
endNext :: Searching -> Result
endNext s = case step s of
  Exhaust _ | not (hasChoices s) -> Success
  Expire _ | hasChoices s -> Success
  next -> Failed
    ( "budget " <> show (budget s) <> ", choices remain: "
        <> show (hasChoices s)
        <> ", but moved to "
        <> name next
    )

-- | The state with its budget set to 0.
zeroed :: Searching -> Searching
zeroed (Searching s) = Searching s { budget = 0 }

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
      it "when started with a negative budget" do
        quickCheck do
          board <- genBoard
          spendable <- chooseInt (-1000) (-1)
          pure (endNext (start spendable board))
      it "when started with budget 0" do
        quickCheck do
          board <- genBoard
          pure (endNext (start 0 board))
      it "when the transitions used up the budget" do
        quickCheck do
          board <- genBoard
          spendable <- genBudget
          let
            -- Every searching state on the run, each with its budget set to 0.
            check s = case endNext (zeroed s) of
              Success -> case step s of
                Continue s' -> check s'
                _ -> Success
              failure -> failure
          pure (check (start spendable board))
      it "in the unsolvable state when no choices remain" do
        case step (Searching { pending: nil, budget: 0 }) of
          Exhaust _ -> pure unit
          next -> fail ("moved to " <> name next)
