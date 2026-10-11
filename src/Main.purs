module Main where

import Prelude

import Effect (Effect)
import Solid.Component as Component
import Solid.Web (mountAt)
import Sudoku.App (app)

main :: Effect Unit
main = mountAt "root" (Component.element app {})
