module Test.Dom.Main where

import Prelude

import Data.String (Pattern(..), contains)
import Effect (Effect)
import Effect.Class (liftEffect)
import Solid.Component as Component
import Solid.Testing (html, mount)
import Sudoku.App (app)
import Test.Dom.CellSpec as CellSpec
import Test.Spec (describe, it)
import Test.Spec.Assertions (shouldSatisfy)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)

main :: Effect Unit
main = runSpecAndExitProcess [ consoleReporter ] do
  describe "App" do
    it "renders the title" do
      mounted <- mount (Component.element app {})
      markup <- html mounted
      liftEffect mounted.dispose
      markup `shouldSatisfy` contains (Pattern "数独")
  CellSpec.spec
