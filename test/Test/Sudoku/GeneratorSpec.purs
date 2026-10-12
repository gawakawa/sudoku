module Test.Sudoku.GeneratorSpec (spec) where

import Prelude

import Control.Monad.State (evalState)
import Sudoku.Generator (fallbackGrid, generateCompleteGrid, removeCells)
import Test.QuickCheck ((===))
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genPositions, genSeed)
import Test.Sudoku.Rules (isValid, keepGiven)

spec :: Spec Unit
spec = describe "Generator" do
  describe "generateCompleteGrid" do
    it "gives a valid board" do
      quickCheck do
        seed <- genSeed
        pure (isValid (evalState generateCompleteGrid seed) === true)
  describe "removeCells" do
    it "leaves a partial board of the complete board" do
      quickCheck do
        seed <- genSeed
        removed <- genPositions
        let complete = evalState generateCompleteGrid seed
        pure (keepGiven (removeCells removed complete) complete === true)
  describe "fallbackGrid" do
    it "is a valid board" do
      isValid fallbackGrid `shouldEqual` true
