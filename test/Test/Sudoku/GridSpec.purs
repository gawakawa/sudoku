module Test.Sudoku.GridSpec (spec) where

import Prelude

import Data.Set as Set
import Sudoku.Grid (getPeers, setValue, valueAt)
import Test.QuickCheck ((===))
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genCellValue, genGrid, genPosition)
import Test.Sudoku.Rules (sharesUnit)

spec :: Spec Unit
spec = do
  describe "getPeers" do
    it "holds the positions sharing a row, column or block" do
      quickCheck do
        p <- genPosition
        q <- genPosition
        pure (Set.member q (getPeers p) === sharesUnit p q)
    it "is symmetric" do
      quickCheck do
        p <- genPosition
        q <- genPosition
        pure (Set.member q (getPeers p) === Set.member p (getPeers q))
    it "has 21 positions, the position itself included" do
      quickCheck do
        p <- genPosition
        pure (Set.size (getPeers p) === 21)

  -- The lens laws for setValue / valueAt. Drop these once setValue is built by
  -- composing library optics, which satisfy them by construction.
  describe "setValue and valueAt" do
    it "reads back what was written (PutGet)" do
      quickCheck do
        g <- genGrid
        p <- genPosition
        v <- genCellValue
        pure (valueAt (setValue p v g) p === v)
    it "leaves the grid unchanged when writing what was read (GetPut)" do
      quickCheck do
        g <- genGrid
        p <- genPosition
        pure (setValue p (valueAt g p) g === g)
    it "keeps only the last of two writes (PutPut)" do
      quickCheck do
        g <- genGrid
        p <- genPosition
        v <- genCellValue
        w <- genCellValue
        pure (setValue p w (setValue p v g) === setValue p w g)
