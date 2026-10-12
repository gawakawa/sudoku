module Main where

import Prelude

import Effect (Effect)
import Solid.Component as Component
import Solid.Web (mountAt)
import Sudoku.App (app)
import Sudoku.Generator (generateInitialGrid)
import Sudoku.Metrics (noop)

main :: Effect Unit
main = do
  initialGrid <- generateInitialGrid
  mountAt "root"
    (Component.element app { initialGrid, metrics: noop })
