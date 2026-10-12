module Test.Sudoku.GeneratorSpec (spec) where

import Prelude

import Sudoku.Generator.Internal (completeGrid, fallbackGrid, fillDiagonal, removeCells)
import Test.QuickCheck ((===))
import Test.QuickCheck.Gen (arrayOf)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genDiagonal, genPositions)
import Test.Sudoku.Rules (isValid, keepGiven)

spec :: Spec Unit
spec = describe "Generator" do
  describe "completeGrid" do
    it "gives a valid board" do
      quickCheck do
        attempts <- arrayOf genDiagonal
        pure (isValid (completeGrid (fillDiagonal <$> attempts)) === true)
  describe "removeCells" do
    it "leaves a partial board of the complete board" do
      quickCheck do
        attempts <- arrayOf genDiagonal
        removed <- genPositions
        let complete = completeGrid (fillDiagonal <$> attempts)
        pure (keepGiven (removeCells removed complete) complete === true)
  describe "fallbackGrid" do
    it "is a valid board" do
      isValid fallbackGrid `shouldEqual` true
