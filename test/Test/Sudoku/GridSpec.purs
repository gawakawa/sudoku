module Test.Sudoku.GridSpec (spec) where

import Prelude

import Data.Array (all, concat, filter, length)
import Data.Maybe (Maybe(..))
import Data.Set as Set
import Sudoku.Grid (calculateCellError, cellAt, getPeers, initCell, initGrid, peerErrors, setValue)
import Sudoku.Types (CellValue, Digit(..), Grid, Index(..), Position(..))
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)

pos :: Index -> Index -> Position
pos row col = Position { row, col }

put :: Index -> Index -> Digit -> Grid -> Grid
put row col d = setValue (pos row col) (Just d)

spec :: Spec Unit
spec = do
  describe "initCell" do
    it "has no value" do
      initCell.value `shouldEqual` (Nothing :: CellValue)
    it "is not initial" do
      initCell.isInitial `shouldEqual` false

  describe "initGrid" do
    it "holds only empty cells" do
      all (_ == initCell) (concat initGrid) `shouldEqual` true

  describe "getPeers" do
    it "has 21 positions for a cell, itself included" do
      let peers = getPeers (pos I4 I4)
      Set.size peers `shouldEqual` 21
      Set.member (pos I4 I4) peers `shouldEqual` true
    it "covers row, column and block" do
      let peers = getPeers (pos I0 I0)
      Set.member (pos I0 I8) peers `shouldEqual` true
      Set.member (pos I8 I0) peers `shouldEqual` true
      Set.member (pos I2 I2) peers `shouldEqual` true
      Set.member (pos I3 I3) peers `shouldEqual` false

  describe "calculateCellError" do
    let origin = pos I0 I0
    it "is false for an empty cell" do
      calculateCellError initGrid origin `shouldEqual` false
    it "detects a duplicate in the row" do
      calculateCellError (put I0 I0 D5 $ put I0 I8 D5 initGrid) origin
        `shouldEqual` true
    it "detects a duplicate in the column" do
      calculateCellError (put I0 I0 D5 $ put I8 I0 D5 initGrid) origin
        `shouldEqual` true
    it "detects a duplicate in the block" do
      calculateCellError (put I0 I0 D5 $ put I2 I2 D5 initGrid) origin
        `shouldEqual` true
    it "ignores the same value outside the peers" do
      calculateCellError (put I0 I0 D5 $ put I3 I3 D5 initGrid) origin
        `shouldEqual` false
    it "is false when values differ" do
      calculateCellError (put I0 I0 D5 $ put I0 I1 D6 initGrid) origin
        `shouldEqual` false

  describe "setValue" do
    it "changes only the given cell" do
      let grid = put I1 I2 D7 initGrid
      cellAt grid (pos I1 I2) `shouldEqual` Just
        { value: Just D7, isInitial: false }
      length (filter (_ /= initCell) (concat grid)) `shouldEqual` 1

  describe "peerErrors" do
    it "reports all 21 peers" do
      length (peerErrors initGrid (pos I4 I4)) `shouldEqual` 21
    it "flags the peers that now conflict" do
      let
        grid = put I0 I1 D5 $ put I0 I0 D5 initGrid
        flagged = filter _.hasError (peerErrors grid (pos I0 I0)) <#> _.pos
      flagged `shouldEqual` [ pos I0 I0, pos I0 I1 ]
