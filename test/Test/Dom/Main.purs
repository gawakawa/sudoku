module Test.Dom.Main where

import Prelude

import Effect (Effect)
import Test.Dom.CellSpec as CellSpec
import Test.Dom.GridSpec as GridSpec
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)

main :: Effect Unit
main = runSpecAndExitProcess [ consoleReporter ] do
  CellSpec.spec
  GridSpec.spec
