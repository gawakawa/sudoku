-- | The solver's state machine, described in docs/DESIGN.md. `Sudoku.Solver`
-- | builds the public API on top of it, and the tests of the machine import this
-- | module. Other modules should use `Sudoku.Solver`.
module Sudoku.Solver.Internal
  ( Slot
  , Outcome
  , Attempt
  , Searching(..)
  , Solved
  , Timeout
  , Unsolvable
  , Next(..)
  , Ended(..)
  , start
  , step
  , solve
  , budget
  , hasChoices
  , solution
  ) where

import Prelude

import Control.Lazy as Control
import Data.Array (zip)
import Data.Array.NonEmpty (NonEmptyArray)
import Data.Enum (enumFromTo)
import Data.Foldable (foldMap, foldl)
import Data.Lazy (Lazy, defer, force)
import Data.List.Lazy (List, concatMap, nil, null, uncons, (:))
import Data.Maybe (Maybe(..), maybe)
import Data.Set as Set
import Data.Set.NonEmpty (NonEmptySet)
import Data.Set.NonEmpty as NonEmptySet
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..))
import Sudoku.Grid (cellAt, getPeers)
import Sudoku.Types (Board, Digit, Grid, Position, indices, positions)

-- | A cell of a partial board: either settled, or still open with at least one
-- | candidate.
data Slot = Fixed Digit | Open (NonEmptySet Digit)

-- | What placing a digit leads to: no cell is left without a candidate, or one
-- | is.
data Outcome = Stuck | Placed (Board Slot)

-- | Placing one digit in one cell. It runs when first forced, and only once.
type Attempt = Lazy Outcome

-- | The attempts not yet made, in depth-first order, and the transitions left.
newtype Searching = Searching { pending :: List Attempt, budget :: Int }

newtype Solved = Solved Grid

data Timeout = Timeout

data Unsolvable = Unsolvable

-- | Where a transition from `Searching` leads.
data Next
  = Continue Searching
  | Finish Solved
  | Expire Timeout
  | Exhaust Unsolvable

-- | Names the transition only. A state has no `Show` instance.
instance Show Next where
  show = case _ of
    Continue _ -> "Continue"
    Finish _ -> "Finish"
    Expire _ -> "Expire"
    Exhaust _ -> "Exhaust"

allDigits :: NonEmptySet Digit
allDigits = NonEmptySet.fromFoldable1
  (enumFromTo bottom top :: NonEmptyArray Digit)

-- | Every cell is open: a given digit `d` leaves only `{d}`, an empty cell
-- | keeps all nine.
initial :: Grid -> Board Slot
initial = map
  (map \cell -> Open (maybe allDigits NonEmptySet.singleton cell.value))

-- | Fixes `pos` to `digit` and removes `digit` from its open peers. `Nothing`
-- | when a peer is left without a candidate.
place :: Position -> Digit -> Board Slot -> Maybe (Board Slot)
place pos digit board =
  traverse
    ( \(Tuple row slots) ->
        traverse (\(Tuple col slot) -> update { row, col } slot)
          (zip indices slots)
    )
    (zip indices board)
  where
  peers = getPeers pos
  update p slot
    | p == pos = Just (Fixed digit)
    | Set.member p peers = case slot of
        Open digits -> Open <$> NonEmptySet.delete digit digits
        Fixed _ -> Just slot
    | otherwise = Just slot

-- | The open cell with the fewest candidates, if any cell is open.
mostConstrained
  :: Board Slot -> Maybe { pos :: Position, digits :: NonEmptySet Digit }
mostConstrained board = foldl pick Nothing positions
  where
  pick best pos = case cellAt board pos of
    Just (Open digits)
      | maybe true (\b -> NonEmptySet.size digits < NonEmptySet.size b.digits)
          best ->
          Just { pos, digits }
    _ -> best

-- | One attempt per candidate of the most constrained open cell; none when no
-- | cell is open.
attemptsOn :: Board Slot -> List Attempt
attemptsOn board = case mostConstrained board of
  Nothing -> nil
  Just { pos, digits } -> NonEmptySet.toUnfoldable digits <#> \digit ->
    defer \_ -> maybe Stuck Placed (place pos digit board)

-- | The board an attempt produced, if its digit could be placed.
boardAfter :: Attempt -> Maybe (Board Slot)
boardAfter attempt = case force attempt of
  Stuck -> Nothing
  Placed board -> Just board

-- | The grid, if no cell is open.
completed :: Board Slot -> Maybe Grid
completed = traverse (traverse toCell)
  where
  toCell = case _ of
    Fixed digit -> Just { value: Just digit, isInitial: true }
    Open _ -> Nothing

-- | Each node, followed by the nodes after it, depth first. Nothing is forced
-- | until the result is consumed.
dfs :: forall a. (a -> List a) -> List a -> List a
dfs next = concatMap \x -> x : Control.defer \_ -> dfs next (next x)

start :: Int -> Grid -> Searching
start spendable grid = Searching
  { pending: dfs (foldMap attemptsOn <<< boardAfter) (attemptsOn (initial grid))
  , budget: spendable
  }

-- | Every placement costs one unit of budget, including one that gets stuck.
step :: Searching -> Next
step (Searching s) = case uncons s.pending of
  -- No attempt is left, so every digit was tried.
  Nothing -> Exhaust Unsolvable
  Just { head, tail }
    | s.budget <= 0 -> Expire Timeout
    | otherwise ->
        let
          -- The attempts after a placed one are already queued in `tail`.
          continue = Continue
            (Searching { pending: tail, budget: s.budget - 1 })
        in
          case boardAfter head of
            Nothing -> continue
            Just board -> case completed board of
              Nothing -> continue
              Just grid -> Finish (Solved grid)

-- | How a search ends.
data Ended = Found Solved | GaveUp Timeout | Impossible Unsolvable

-- | Runs the machine from the start until it ends.
solve :: Int -> Grid -> Ended
solve spendable grid = go (start spendable grid)
  where
  go s = case step s of
    Continue s' -> go s'
    Finish solved -> Found solved
    Expire timeout -> GaveUp timeout
    Exhaust unsolvable -> Impossible unsolvable

-- | The transitions left.
budget :: Searching -> Int
budget (Searching s) = s.budget

-- | Whether any attempt is left to make.
hasChoices :: Searching -> Boolean
hasChoices (Searching s) = not (null s.pending)

-- | The board a search finished with.
solution :: Solved -> Grid
solution (Solved grid) = grid
