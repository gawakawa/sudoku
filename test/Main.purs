module Test.Main where

import Prelude

import Effect (Effect)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner.Node (runSpecAndExitProcess)
import Test.Sudoku.Data.BoardSpec as BoardSpec
import Test.Sudoku.Data.PuzzleSpec as PuzzleSpec
import Test.Sudoku.Generator.InternalSpec as GeneratorInternalSpec
import Test.Sudoku.Solver.InternalSpec as SolverInternalSpec
import Test.Sudoku.SolverSpec as SolverSpec

main :: Effect Unit
main = runSpecAndExitProcess [ consoleReporter ] do
  BoardSpec.spec
  PuzzleSpec.spec
  SolverSpec.spec
  SolverInternalSpec.spec
  GeneratorInternalSpec.spec
