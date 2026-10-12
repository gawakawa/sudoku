-- | One square of the board: an input that shows a digit and reports the
-- | player's edits and arrow-key moves.
module Sudoku.UI.Component.Cell
  ( Direction(..)
  , Props
  , cell
  ) where

import Prelude

import DOM.HTML.Indexed.InputType (InputType(..))
import Data.Foldable (for_, intercalate)
import Data.Maybe (Maybe(..), maybe)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Solid.Component (Component, component)
import Solid.DOM (targetValue)
import Solid.DOM.HTML as H
import Solid.Reactivity (createEffect_)
import Solid.Signal (Accessor, get)
import Sudoku.Data.Board (Index(..), Position)
import Sudoku.Data.Puzzle (CellValue, decode, encode)
import Sudoku.UI.Metrics (Metrics)
import Web.Event.Event (Event, currentTarget, preventDefault)
import Web.HTML.HTMLInputElement (HTMLInputElement)
import Web.HTML.HTMLInputElement as HTMLInputElement
import Web.UIEvent.KeyboardEvent (KeyboardEvent)
import Web.UIEvent.KeyboardEvent as KeyboardEvent

data Direction = Up | Down | Left | Right

type Props =
  { pos :: Position
  , value :: Accessor CellValue
  , isInitial :: Accessor Boolean
  , hasError :: Accessor Boolean
  , onChange :: CellValue -> Effect Unit
  , onNavigate :: Direction -> Effect Unit
  , ref :: HTMLInputElement -> Effect Unit
  , metrics :: Metrics
  }

base :: Array String
base =
  [ "w-[var(--cell-size)]"
  , "h-[var(--cell-size)]"
  , "border"
  , "border-gray-300"
  , "text-center"
  , "text-[length:var(--cell-font-size)]"
  , "caret-transparent"
  , "focus:outline-none"
  , "focus:bg-blue-50"
  , "focus:ring-2"
  , "focus:ring-inset"
  , "focus:ring-blue-500"
  ]

-- | The thick line after the third and sixth columns.
rightEdge :: Index -> Array String
rightEdge = case _ of
  I2 -> [ "border-r-2", "border-r-gray-900" ]
  I5 -> [ "border-r-2", "border-r-gray-900" ]
  _ -> []

-- | The thick line under the third and sixth rows.
bottomEdge :: Index -> Array String
bottomEdge = case _ of
  I2 -> [ "border-b-2", "border-b-gray-900" ]
  I5 -> [ "border-b-2", "border-b-gray-900" ]
  _ -> []

state :: Boolean -> Boolean -> String
state hasError isInitial = case hasError, isInitial of
  true, _ -> "bg-red-100 text-red-700 border-red-500"
  false, true -> "font-bold text-gray-900 bg-gray-50 cursor-not-allowed"
  false, false -> "text-blue-600 bg-white"

cell :: Component Props
cell = component \props -> do
  let
    fixed = intercalate " "
      (base <> rightEdge props.pos.col <> bottomEdge props.pos.row)
    shown = maybe "" encode <$> props.value

    -- Initial cells never change.
    change value = do
      isInitial <- get props.isInitial
      unless isInitial (props.onChange value)

    handleKey :: KeyboardEvent -> Effect Unit
    handleKey event = case KeyboardEvent.key event of
      "Tab" -> pure unit
      "Backspace" -> block *> change Nothing
      "Delete" -> block *> change Nothing
      "ArrowUp" -> block *> props.onNavigate Up
      "ArrowDown" -> block *> props.onNavigate Down
      "ArrowLeft" -> block *> props.onNavigate Left
      "ArrowRight" -> block *> props.onNavigate Right
      key -> block *> for_ (decode key) (change <<< Just)
      where
      block = preventDefault (KeyboardEvent.toEvent event)

    -- Text that reaches the input without a key press, such as from an
    -- on-screen keyboard. What is not a digit is taken back.
    handleInput :: Event -> Effect Unit
    handleInput event = do
      text <- targetValue event
      case text of
        "" -> props.onChange Nothing
        _ -> case decode text of
          Just digit -> props.onChange (Just digit)
          Nothing -> do
            current <- get shown
            for_ (currentTarget event >>= HTMLInputElement.fromEventTarget)
              (HTMLInputElement.setValue current)

  createEffect_
    (Tuple <$> props.value <*> (Tuple <$> props.hasError <*> props.isInitial))
    \_ -> props.metrics.cellUpdated props.pos

  pure $ H.input
    { type: InputText
    , pattern: "[1-9]"
    , maxLength: 1
    , value: shown
    , readOnly: props.isInitial
    , class: (\hasError isInitial -> fixed <> " " <> state hasError isInitial)
        <$> props.hasError
        <*> props.isInitial
    , ref: props.ref
    , onKeyDown: handleKey
    , onInput: handleInput
    }
