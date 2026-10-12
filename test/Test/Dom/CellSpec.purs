module Test.Dom.CellSpec (spec) where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Exception (throw)
import Solid.Component as Component
import Solid.Signal (createSignal, set)
import Solid.Testing (Mounted, inputText, mount, query, settle)
import Sudoku.Data.Board (Index(..))
import Sudoku.Data.Puzzle (CellValue, Digit(..))
import Sudoku.UI.Component.Cell (cell)
import Sudoku.UI.Metrics (noop)
import Test.Dom.Event (press)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Web.DOM.Element (Element)
import Web.HTML.HTMLInputElement as HTMLInputElement

type Shown =
  { mounted :: Mounted
  , input :: Element
  }

-- | A cell whose digit is kept in a signal that its `onChange` writes,
-- | the way the grid keeps it.
mountCell :: { value :: CellValue, isInitial :: Boolean } -> Aff Shown
mountCell start = do
  value /\ setValue <- liftEffect (createSignal start.value)
  mounted <- mount $ Component.element cell
    { pos: { row: I0, col: I0 }
    , value
    , isInitial: pure start.isInitial
    , hasError: pure false
    , onChange: set setValue
    , onNavigate: \_ -> pure unit
    , ref: \_ -> pure unit
    , metrics: noop
    }
  found <- query "input" mounted
  case found of
    Just input -> pure { mounted, input }
    Nothing -> liftEffect (throw "no input in the cell")

-- | What the cell shows after Solid has applied the updates.
displayed :: Shown -> Aff String
displayed shown = do
  settle
  liftEffect case HTMLInputElement.fromElement shown.input of
    Just input -> HTMLInputElement.value input
    Nothing -> throw "not an input"

-- | The player presses a key.
pressKey :: String -> Shown -> Aff Unit
pressKey key shown = liftEffect (press key shown.input)

-- | Text reaches the input without a key press, as from an on-screen keyboard.
enterText :: String -> Shown -> Aff Unit
enterText text shown = liftEffect (inputText text shown.input)

leave :: Shown -> Effect Unit
leave shown = shown.mounted.dispose

spec :: Spec Unit
spec = describe "Cell" do
  describe "an editable cell" do
    it "shows 8 when 8 is pressed on an empty cell" do
      shown <- mountCell { value: Nothing, isInitial: false }
      pressKey "8" shown
      displayed shown >>= shouldEqual "8"
      liftEffect (leave shown)
    it "shows 3 in place of 5 when 3 is pressed" do
      shown <- mountCell { value: Just D5, isInitial: false }
      pressKey "3" shown
      displayed shown >>= shouldEqual "3"
      liftEffect (leave shown)
    it "is emptied by Backspace" do
      shown <- mountCell { value: Just D5, isInitial: false }
      pressKey "Backspace" shown
      displayed shown >>= shouldEqual ""
      liftEffect (leave shown)
    it "is emptied by Delete" do
      shown <- mountCell { value: Just D5, isInitial: false }
      pressKey "Delete" shown
      displayed shown >>= shouldEqual ""
      liftEffect (leave shown)
    it "stays empty when a, 0 or ! is pressed" do
      shown <- mountCell { value: Nothing, isInitial: false }
      pressKey "a" shown
      displayed shown >>= shouldEqual ""
      pressKey "0" shown
      displayed shown >>= shouldEqual ""
      pressKey "!" shown
      displayed shown >>= shouldEqual ""
      liftEffect (leave shown)
    it "shows 8 when an on-screen keyboard enters 8" do
      shown <- mountCell { value: Nothing, isInitial: false }
      enterText "8" shown
      displayed shown >>= shouldEqual "8"
      liftEffect (leave shown)
    it "keeps showing 5 when an on-screen keyboard enters a" do
      shown <- mountCell { value: Just D5, isInitial: false }
      enterText "a" shown
      displayed shown >>= shouldEqual "5"
      liftEffect (leave shown)
  describe "an initial cell" do
    it "keeps showing 7 when 3, Backspace or Delete is pressed" do
      shown <- mountCell { value: Just D7, isInitial: true }
      pressKey "3" shown
      displayed shown >>= shouldEqual "7"
      pressKey "Backspace" shown
      displayed shown >>= shouldEqual "7"
      pressKey "Delete" shown
      displayed shown >>= shouldEqual "7"
      liftEffect (leave shown)
