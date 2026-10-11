module Sudoku.Solver
  ( SolveResult(..)
  , solve
  ) where

import Prelude

import Data.Enum (enumFromTo)
import Data.Foldable (any, foldl)
import Data.FoldableWithIndex (foldlWithIndex)
import Data.FunctorWithIndex (mapWithIndex)
import Data.Generic.Rep (class Generic)
import Data.Map (Map)
import Data.Map as Map
import Data.Maybe (Maybe(..), isNothing)
import Data.Set (Set)
import Data.Set as Set
import Data.Show.Generic (genericShow)
import Data.Tuple (Tuple(..))
import Sudoku.Grid (getPeers, modifyCell, valueAt)
import Sudoku.Types (Digit, Grid, Position, positions)

-- | `Timeout` means the step budget ran out before the search finished, so
-- | nothing is known about solvability.
data SolveResult = Solved Grid | Timeout | Unsolvable

derive instance Eq SolveResult
derive instance Generic SolveResult _

instance Show SolveResult where
  show = genericShow

-- | Possible digits of each empty cell. A cell leaves the map once it is
-- | filled, so an empty map means the grid is complete.
type Candidates = Map Position (Set Digit)

allDigits :: Set Digit
allDigits = Set.fromFoldable (enumFromTo bottom top :: Array Digit)

initialCandidates :: Grid -> Candidates
initialCandidates grid = Map.fromFoldable do
  pos <- positions
  if isNothing (valueAt grid pos) then
    [ Tuple pos (Set.difference allDigits (peerValues pos)) ]
  else []
  where
  peerValues pos = Set.catMaybes (Set.map (valueAt grid) (getPeers pos))

-- | Fills `pos` with `digit` and removes `digit` from its peers' candidates.
-- | `Nothing` when that leaves some cell without a candidate.
assign :: Position -> Digit -> Candidates -> Maybe Candidates
assign pos digit candidates =
  if any Set.isEmpty updated then Nothing else Just updated
  where
  peers = getPeers pos
  updated = Map.delete pos candidates # mapWithIndex \p ds ->
    if Set.member p peers then Set.delete digit ds else ds

-- | The empty cell with the fewest candidates (MRV), if any cell is empty.
mostConstrained :: Candidates -> Maybe { pos :: Position, digits :: Set Digit }
mostConstrained = foldlWithIndex pick Nothing
  where
  pick pos best digits = case best of
    Just b | Set.size b.digits <= Set.size digits -> best
    _ -> Just { pos, digits }

-- | Depth-first search that fills the most constrained cell first. Every
-- | placement costs one step; a `Timeout` in any subtree ends the whole search.
backtrack :: Int -> Grid -> Candidates -> SolveResult
backtrack steps grid candidates
  | steps <= 0 = Timeout
  | otherwise =
      case mostConstrained candidates of
        Nothing -> Solved grid
        Just { pos, digits } ->
          foldl (tryDigit pos) Unsolvable
            (Set.toUnfoldable digits :: Array Digit)
      where
      tryDigit pos result digit = case result of
        Unsolvable -> case assign pos digit candidates of
          Nothing -> Unsolvable
          Just next ->
            backtrack (steps - 1)
              (modifyCell pos _ { value = Just digit, isInitial = true } grid)
              next
        _ -> result

-- | Filled cells are kept as they are. Cells the search fills become initial.
solve :: Int -> Grid -> SolveResult
solve steps grid = backtrack steps grid (initialCandidates grid)
