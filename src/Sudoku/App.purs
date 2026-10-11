module Sudoku.App where

import Prelude

import Solid.Component (Component, component)
import Solid.DOM.HTML as H

app :: Component {}
app = component \_ ->
  pure $ H.h1 { class: "text-2xl md:text-4xl font-bold text-gray-800" } "数独"
