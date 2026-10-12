-- | Random puzzle generation. Only the choices that need randomness, the digits
-- | of the diagonal blocks and the cells to empty, are drawn; the rest is pure.
module Sudoku.Generator
  ( generateInitialGrid
  ) where

import Prelude

import Control.Monad.State (State, evalState, state)
import Data.Array (concatMap, filter, sortWith, zip, (..))
import Data.Enum (enumFromTo)
import Data.Int.Bits (and, shr)
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Unfoldable (replicateA)
import Effect (Effect)
import Random.LCG (Seed, lcgNext, randomSeed, unSeed)
import Sudoku.Data.Board (Position, positions)
import Sudoku.Data.Puzzle (Digit, Grid)
import Sudoku.Generator.Internal (completeGrid, fillDiagonal, removeCells)

type Random = State Seed

-- | Parameter: how many boards to try before falling back to `fallbackGrid`.
attempts :: Int
attempts = 1

digits :: Array Digit
digits = enumFromTo bottom top

draw :: Random Int
draw = state \seed -> Tuple (unSeed seed) (lcgNext seed)

-- | Sorts the digits by a random key each.
shuffleDigits :: Random (Array Digit)
shuffleDigits = do
  keys <- traverse (const draw) digits
  pure (map snd (sortWith fst (zip keys digits)))

-- | Three draws give 81 bits of 27 each; a position is picked when its bit
-- | is set.
generateRandomPositions :: Random (Array Position)
generateRandomPositions = do
  masks <- traverse (const draw) (1 .. 3)
  pure (map fst (filter snd (zip positions (concatMap bits masks))))
  where
  bits mask = (0 .. 26) <#> \i -> (mask `shr` i) `and` 1 == 1

generateInitialGrid :: Effect Grid
generateInitialGrid = evalState puzzle <$> randomSeed
  where
  puzzle = do
    blocks <- replicateA attempts (replicateA 3 shuffleDigits)
    removed <- generateRandomPositions
    pure (removeCells removed (completeGrid (fillDiagonal <$> blocks)))
