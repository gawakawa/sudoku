-- | Measures how many placements the solver makes on the boards the generator
-- | starts from, and how often that exceeds the generator's budget.
module Bench.Main (main) where

import Prelude

import Control.Monad.State (evalState)
import Data.Array (catMaybes, filter, index, length, sort)
import Data.Foldable (sum)
import Data.Maybe (Maybe(..), maybe)
import Data.Unfoldable (replicateA)
import Effect (Effect)
import Effect.Console (log)
import Random.LCG (randomSeed)
import Sudoku.Data.Puzzle (Grid)
import Sudoku.Generator.Internal (budget, fillDiagonal, shuffleDigits)
import Sudoku.Solver.Internal (Next(..), start, step)

samples :: Int
samples = 1000

-- | Placements until the solver finds a solution; `Nothing` if it ends
-- | without one.
placements :: Grid -> Maybe Int
placements grid = go 1 (start top grid)
  where
  go n s = case step s of
    Continue s' -> go (n + 1) s'
    Finish _ -> Just n
    Expire _ -> Nothing
    Exhaust _ -> Nothing

main :: Effect Unit
main = do
  seed <- randomSeed
  let
    boards = fillDiagonal <$>
      evalState (replicateA samples (replicateA 3 shuffleDigits)) seed
    counts = sort (catMaybes (placements <$> boards))
    n = length counts
    at i = maybe "-" show (index counts i)
    over = length (filter (_ > budget) counts)
  log
    ("samples:  " <> show samples <> " (unsolved " <> show (samples - n) <> ")")
  log ("min:      " <> at 0)
  log ("p95:      " <> at (n * 95 / 100))
  log ("max:      " <> at (n - 1))
  log ("mean:     " <> show (sum counts / max 1 n))
  log ("> budget: " <> show over <> " (" <> show budget <> ")")
