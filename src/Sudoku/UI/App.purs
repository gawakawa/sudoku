-- | The game: the board in one store, with each cell's error state derived
-- | from the values it shares a row, column or block with.
module Sudoku.UI.App
  ( Props
  , app
  ) where

import Prelude

import Data.Enum (fromEnum)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (for)
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Solid.Component (Component, component)
import Solid.Component as Component
import Solid.DOM.HTML as H
import Solid.Reactivity (createMemo)
import Solid.Setup (liftSetup)
import Solid.Signal (Accessor, sample)
import Solid.Store (atIndex, atKey, createStore, focusKey, items, set, update, value)
import Sudoku.Data.Board (Position, cellAt, indices)
import Sudoku.Data.Puzzle (CellValue, Grid, hasConflict)
import Sudoku.UI.Component.Grid (grid)
import Sudoku.UI.Component.MetricsPanel (metricsPanel)
import Sudoku.UI.Metrics (Metrics, Snapshot)

type Props =
  { initialGrid :: Grid
  , metrics :: Metrics
  , snapshot :: Effect Snapshot
  }

app :: Component Props
app = component \props -> do
  liftSetup props.metrics.appRendered
  store /\ setter <- createStore props.initialGrid
  rows <- sample (items store)
  cursors <- for rows \row -> sample (items row)
  let
    valueOf :: Position -> Accessor CellValue
    valueOf pos = case cellAt cursors pos of
      Just cursor -> value (focusKey @"value" cursor)
      Nothing -> pure Nothing
  errors <- for indices \row -> for indices \col ->
    createMemo (hasConflict valueOf { row, col })
  let
    hasError :: Position -> Accessor Boolean
    hasError pos = fromMaybe (pure false) (cellAt errors pos)

    -- The next value is written without reading the store back.
    handleChange :: Position -> CellValue -> Effect Unit
    handleChange pos cellValue = do
      props.metrics.gridUpdated
      update setter
        ( atIndex (fromEnum pos.row)
            (atIndex (fromEnum pos.col) (atKey @"value" (set cellValue)))
        )

  pure $ H.div { class: "min-h-screen flex flex-col" }
    [ H.div
        { class:
            "flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 md:p-8 md:pr-72"
        }
        [ H.h1
            { class: "text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-8"
            }
            "数独"
        , Component.element grid
            { grid: store
            , hasError
            , onChange: handleChange
            , metrics: props.metrics
            }
        ]
    , Component.element metricsPanel { snapshot: props.snapshot }
    ]
