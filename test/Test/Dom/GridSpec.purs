module Test.Dom.GridSpec (spec) where

import Prelude

import Data.Array (index)
import Data.Enum (fromEnum)
import Data.Maybe (Maybe(..))
import Data.Tuple.Nested ((/\))
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Exception (throw)
import Solid.Component as Component
import Solid.Store (atIndex, atKey, createStore, set, update)
import Solid.Testing (Mounted, mount, settle)
import Sudoku.Data.Board (Index(..), Position, modifyCell)
import Sudoku.Data.Puzzle (Digit(..), Grid, initGrid)
import Sudoku.UI.Component.Grid (grid)
import Sudoku.UI.Metrics (noop)
import Test.Dom.Event (press)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)
import Web.DOM.Element as Element
import Web.DOM.NodeList as NodeList
import Web.DOM.ParentNode (QuerySelector(..), querySelectorAll)
import Web.HTML (window)
import Web.HTML.HTMLDocument (activeElement)
import Web.HTML.HTMLElement as HTMLElement
import Web.HTML.HTMLInputElement (HTMLInputElement)
import Web.HTML.HTMLInputElement as HTMLInputElement
import Web.HTML.Window (document)

-- | A board kept in a store that its `onChange` writes, the way the app
-- | keeps it.
mountGrid :: Grid -> Aff Mounted
mountGrid start = do
  store /\ setter <- liftEffect (createStore start)
  mount $ Component.element grid
    { grid: store
    , hasError: \_ -> pure false
    , onChange: \pos value -> update setter
        ( atIndex (fromEnum pos.row)
            (atIndex (fromEnum pos.col) (atKey @"value" (set value)))
        )
    , metrics: noop
    }

inputAt :: Position -> Mounted -> Aff HTMLInputElement
inputAt pos mounted = liftEffect do
  nodes <- NodeList.toArray
    =<< querySelectorAll (QuerySelector "input")
      (Element.toParentNode mounted.root)
  case
    index nodes (fromEnum pos.row * 9 + fromEnum pos.col)
      >>= HTMLInputElement.fromNode
    of
    Just input -> pure input
    Nothing -> throw "no input at the position"

-- | The player picks a square.
select :: Position -> Mounted -> Aff Unit
select pos mounted = do
  input <- inputAt pos mounted
  liftEffect (HTMLElement.focus (HTMLInputElement.toHTMLElement input))

-- | The player presses a key; it reaches the square that has the focus.
pressKey :: String -> Aff Unit
pressKey key = liftEffect do
  focused <- activeElement =<< document =<< window
  case focused of
    Just element -> press key (HTMLElement.toElement element)
    Nothing -> throw "no square has the focus"

-- | What the square shows after Solid has applied the updates.
displayed :: Position -> Mounted -> Aff String
displayed pos mounted = do
  settle
  input <- inputAt pos mounted
  liftEffect (HTMLInputElement.value input)

spec :: Spec Unit
spec = describe "Grid" do
  describe "an arrow key moves to the neighbouring square" do
    it "ArrowUp moves to the square above" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I4 } mounted
      pressKey "ArrowUp"
      pressKey "8"
      displayed { row: I3, col: I4 } mounted >>= shouldEqual "8"
      displayed { row: I4, col: I4 } mounted >>= shouldEqual ""
      liftEffect mounted.dispose
    it "ArrowDown moves to the square below" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I4 } mounted
      pressKey "ArrowDown"
      pressKey "8"
      displayed { row: I5, col: I4 } mounted >>= shouldEqual "8"
      displayed { row: I4, col: I4 } mounted >>= shouldEqual ""
      liftEffect mounted.dispose
    it "ArrowLeft moves to the square on the left" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I4 } mounted
      pressKey "ArrowLeft"
      pressKey "8"
      displayed { row: I4, col: I3 } mounted >>= shouldEqual "8"
      displayed { row: I4, col: I4 } mounted >>= shouldEqual ""
      liftEffect mounted.dispose
    it "ArrowRight moves to the square on the right" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I4 } mounted
      pressKey "ArrowRight"
      pressKey "8"
      displayed { row: I4, col: I5 } mounted >>= shouldEqual "8"
      displayed { row: I4, col: I4 } mounted >>= shouldEqual ""
      liftEffect mounted.dispose
  describe "an arrow key pointing off the board does not move" do
    it "ArrowUp on the top row" do
      mounted <- mountGrid (initGrid unit)
      select { row: I0, col: I4 } mounted
      pressKey "ArrowUp"
      pressKey "8"
      displayed { row: I0, col: I4 } mounted >>= shouldEqual "8"
      liftEffect mounted.dispose
    it "ArrowDown on the bottom row" do
      mounted <- mountGrid (initGrid unit)
      select { row: I8, col: I4 } mounted
      pressKey "ArrowDown"
      pressKey "8"
      displayed { row: I8, col: I4 } mounted >>= shouldEqual "8"
      liftEffect mounted.dispose
    it "ArrowLeft on the left column" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I0 } mounted
      pressKey "ArrowLeft"
      pressKey "8"
      displayed { row: I4, col: I0 } mounted >>= shouldEqual "8"
      liftEffect mounted.dispose
    it "ArrowRight on the right column" do
      mounted <- mountGrid (initGrid unit)
      select { row: I4, col: I8 } mounted
      pressKey "ArrowRight"
      pressKey "8"
      displayed { row: I4, col: I8 } mounted >>= shouldEqual "8"
      liftEffect mounted.dispose
  describe "an initial square" do
    it "lets the player move away with an arrow key" do
      mounted <- mountGrid
        ( modifyCell { row: I4, col: I4 }
            (const { value: Just D5, isInitial: true })
            (initGrid unit)
        )
      select { row: I4, col: I4 } mounted
      pressKey "ArrowRight"
      pressKey "8"
      displayed { row: I4, col: I5 } mounted >>= shouldEqual "8"
      displayed { row: I4, col: I4 } mounted >>= shouldEqual "5"
      liftEffect mounted.dispose
