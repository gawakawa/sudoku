-- | The 9x9 board: a cell per square, with arrow keys moving the focus between
-- | neighbouring cells.
module Sudoku.Component.Grid
  ( Props
  , grid
  ) where

import Prelude

import Control.Monad.ST.Global (toEffect)
import Data.Array (concat, replicate, zipWith)
import Data.Array.ST as STArray
import Data.Enum (fromEnum, pred, succ)
import Data.Foldable (for_)
import Data.Maybe (Maybe(..))
import Data.Traversable (for)
import Effect (Effect)
import Solid.Component (Component, component)
import Solid.Component as Component
import Solid.DOM.HTML as H
import Solid.Setup (liftSetup)
import Solid.Signal (Accessor, sample)
import Solid.Store (Store, focusKey, items, value)
import Sudoku.Component.Cell (Direction(..), cell)
import Sudoku.Metrics (Metrics)
import Sudoku.Types (CellValue, Grid, Position, indices)
import Web.HTML.HTMLElement as HTMLElement
import Web.HTML.HTMLInputElement (HTMLInputElement)
import Web.HTML.HTMLInputElement as HTMLInputElement

type Props =
  { grid :: Store Grid
  , hasError :: Position -> Accessor Boolean
  , onChange :: Position -> CellValue -> Effect Unit
  , metrics :: Metrics
  }

-- | The place of a position in a flat array of the 81 cells, row by row.
slot :: Position -> Int
slot pos = fromEnum pos.row * 9 + fromEnum pos.col

-- | The neighbouring position, or `Nothing` at the edge of the board.
neighbour :: Direction -> Position -> Maybe Position
neighbour direction pos = case direction of
  Up -> pred pos.row <#> \row -> pos { row = row }
  Down -> succ pos.row <#> \row -> pos { row = row }
  Left -> pred pos.col <#> \col -> pos { col = col }
  Right -> succ pos.col <#> \col -> pos { col = col }

grid :: Component Props
grid = component \props -> do
  liftSetup props.metrics.gridRendered
  refs <- liftSetup (toEffect (STArray.thaw (replicate 81 Nothing)))
  rows <- sample (items props.grid)
  cells <- for rows \row -> sample (items row)
  let
    remember :: Position -> HTMLInputElement -> Effect Unit
    remember pos input =
      void (toEffect (STArray.poke (slot pos) (Just input) refs))

    navigate :: Position -> Direction -> Effect Unit
    navigate pos direction = for_ (neighbour direction pos) \next -> do
      found <- toEffect (STArray.peek (slot next) refs)
      for_ (join found)
        (HTMLElement.focus <<< HTMLInputElement.toHTMLElement)

    view row col cursor =
      let
        pos = { row, col }
      in
        Component.element cell
          { pos
          , value: value (focusKey @"value" cursor)
          , isInitial: value (focusKey @"isInitial" cursor)
          , hasError: props.hasError pos
          , onChange: props.onChange pos
          , onNavigate: navigate pos
          , ref: remember pos
          , metrics: props.metrics
          }

  pure $ H.div { class: "inline-block border-2 border-gray-900" }
    [ H.div
        { class: "grid grid-cols-[repeat(9,var(--cell-size))]" }
        ( concat
            ( zipWith (\row -> zipWith (view row) indices) indices cells
            )
        )
    ]
