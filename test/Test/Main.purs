module Test.Main where

import Prelude

import Effect (Effect)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)
import Test.Sudoku.GridSpec as GridSpec
import Test.Sudoku.Solver.InternalSpec as InternalSpec
import Test.Sudoku.SolverSpec as SolverSpec
import Test.Sudoku.TypesSpec as TypesSpec

main :: Effect Unit
main = runSpecAndExitProcess [ consoleReporter ] do
  TypesSpec.spec
  GridSpec.spec
  SolverSpec.spec
  InternalSpec.spec
