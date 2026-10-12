module Main where

import Prelude

import Effect (Effect)
import Solid.Component as Component
import Solid.DOM.HTML as H
import Solid.Web (mountAt)
import Sudoku.App (app)
import Sudoku.Component.MetricsPanel (metricsPanel)
import Sudoku.Generator (generateInitialGrid)
import Sudoku.Metrics (counting)

main :: Effect Unit
main = do
  initialGrid <- generateInitialGrid
  { metrics, snapshot } <- counting
  mountAt "root"
    ( H.div { class: "min-h-screen flex flex-col" }
        [ Component.element app { initialGrid, metrics }
        , Component.element metricsPanel { snapshot }
        ]
    )
