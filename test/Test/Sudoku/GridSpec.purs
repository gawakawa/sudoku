module Test.Sudoku.GridSpec (spec) where

import Prelude

import Data.Array (any)
import Data.Foldable (all)
import Data.Identity (Identity(..))
import Data.Newtype (unwrap)
import Data.Set as Set
import Sudoku.Grid (getPeers, hasConflict, setValue, valueAt)
import Sudoku.Types (Grid, Position, positions)
import Test.QuickCheck ((<?>), (===))
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBoard, genCellValue, genGrid, genPosition, genPuzzle)
import Test.Sudoku.Rules (shareUnit)

conflict :: Grid -> Position -> Boolean
conflict grid = unwrap <<< hasConflict (Identity <<< valueAt grid)

spec :: Spec Unit
spec = do
  describe "hasConflict" do
    it "is false everywhere on a board with no repeated digit" do
      quickCheck do
        g <- genPuzzle
        pure
          (not (any (conflict g) positions) <?> "a conflict on a valid board")
    it "holds for a cell only if a peer with the same digit holds it too" do
      quickCheck do
        g <- genBoard
        pure
          ( all (\p -> not (conflict g p) || partnerConflicts g p) positions
              <?> "a conflicting cell has no conflicting partner"
          )
  describe "getPeers" do
    it "holds the positions sharing a row, column or block" do
      quickCheck do
        p <- genPosition
        q <- genPosition
        pure (Set.member q (getPeers p) === shareUnit p q)

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

partnerConflicts :: Grid -> Position -> Boolean
partnerConflicts g p = any
  (\q -> q /= p && valueAt g q == valueAt g p && conflict g q)
  (Set.toUnfoldable (getPeers p))
