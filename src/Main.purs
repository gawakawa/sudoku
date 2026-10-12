module Main where

import Prelude

import Effect (Effect)
import Solid.Component as Component
import Solid.Web (mountAt)
import Sudoku.Generator (generateInitialGrid)
import Sudoku.UI.App (app)
import Sudoku.UI.Metrics (counting)

main :: Effect Unit
main = do
  initialGrid <- generateInitialGrid
  { metrics, snapshot } <- counting
  mountAt "root" (Component.element app { initialGrid, metrics, snapshot })
