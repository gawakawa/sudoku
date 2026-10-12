module Test.Sudoku.Data.BoardSpec (spec) where

import Prelude

import Data.Set as Set
import Sudoku.Data.Board (getPeers)
import Test.QuickCheck ((===))
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genPosition)
import Test.Sudoku.Rules (shareUnit)

spec :: Spec Unit
spec = do
  describe "getPeers" do
    it "holds the positions sharing a row, column or block" do
      quickCheck do
        p <- genPosition
        q <- genPosition
        pure (Set.member q (getPeers p) === shareUnit p q)
