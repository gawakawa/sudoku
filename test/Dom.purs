module Test.Dom where

import Prelude

import Effect (Effect)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)
import Test.Sudoku.UI.Component.CellSpec as CellSpec

main :: Effect Unit
main = runSpecAndExitProcess [ consoleReporter ] do
  CellSpec.spec
