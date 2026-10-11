module Test.Sudoku.GridSpec (spec) where

import Prelude

import Data.Array (all, concat, filter, length)
import Data.Maybe (Maybe(..))
import Data.Set as Set
import Sudoku.Grid (calculateCellError, cellAt, getPeers, initCell, initGrid, peerErrors, setValue)
import Sudoku.Types (CellValue, Grid, fromInt)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)

put :: Int -> Int -> Int -> Grid -> Grid
put row col n = setValue { row, col } (fromInt n)

spec :: Spec Unit
spec = do
  describe "initCell" do
    it "has no value" do
      initCell.value `shouldEqual` (Nothing :: CellValue)
    it "is not initial" do
      initCell.isInitial `shouldEqual` false

  describe "initGrid" do
    it "is 9x9" do
      length initGrid `shouldEqual` 9
      all (\row -> length row == 9) initGrid `shouldEqual` true
    it "holds only empty cells" do
      all (_ == initCell) (concat initGrid) `shouldEqual` true

  describe "getPeers" do
    it "has 21 positions for a cell, itself included" do
      let peers = getPeers { row: 4, col: 4 }
      Set.size peers `shouldEqual` 21
      Set.member { row: 4, col: 4 } peers `shouldEqual` true
    it "covers row, column and block" do
      let peers = getPeers { row: 0, col: 0 }
      Set.member { row: 0, col: 8 } peers `shouldEqual` true
      Set.member { row: 8, col: 0 } peers `shouldEqual` true
      Set.member { row: 2, col: 2 } peers `shouldEqual` true
      Set.member { row: 3, col: 3 } peers `shouldEqual` false

  describe "calculateCellError" do
    let pos = { row: 0, col: 0 }
    it "is false for an empty cell" do
      calculateCellError initGrid pos `shouldEqual` false
    it "detects a duplicate in the row" do
      calculateCellError (put 0 0 5 $ put 0 8 5 initGrid) pos `shouldEqual` true
    it "detects a duplicate in the column" do
      calculateCellError (put 0 0 5 $ put 8 0 5 initGrid) pos `shouldEqual` true
    it "detects a duplicate in the block" do
      calculateCellError (put 0 0 5 $ put 2 2 5 initGrid) pos `shouldEqual` true
    it "ignores the same value outside the peers" do
      calculateCellError (put 0 0 5 $ put 3 3 5 initGrid) pos `shouldEqual`
        false
    it "is false when values differ" do
      calculateCellError (put 0 0 5 $ put 0 1 6 initGrid) pos `shouldEqual`
        false

  describe "setValue" do
    it "changes only the given cell" do
      let grid = put 1 2 7 initGrid
      cellAt grid { row: 1, col: 2 } `shouldEqual` Just
        { value: fromInt 7, isInitial: false }
      length (filter (_ /= initCell) (concat grid)) `shouldEqual` 1

  describe "peerErrors" do
    it "reports all 21 peers" do
      length (peerErrors initGrid { row: 4, col: 4 }) `shouldEqual` 21
    it "flags the peers that now conflict" do
      let
        grid = put 0 1 5 $ put 0 0 5 initGrid
        flagged = filter _.hasError (peerErrors grid { row: 0, col: 0 }) <#>
          _.pos
      flagged `shouldEqual` [ { row: 0, col: 0 }, { row: 0, col: 1 } ]
