-- | Random puzzle generation. Randomness is a `Seed` threaded through `State`;
-- | `Effect` is used only to get the first seed.
module Sudoku.Generator
  ( Random
  , fallbackGrid
  , generateCompleteGrid
  , generateRandomPositions
  , removeCells
  , generateInitialGrid
  ) where

import Prelude

import Control.Monad.State (State, evalState, state)
import Data.Array (concatMap, filter, findMap, sortWith, zip, (..))
import Data.Either (hush)
import Data.Enum (enumFromTo)
import Data.Foldable (foldM, foldl)
import Data.Int.Bits (and, shr)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Effect (Effect)
import Random.LCG (Seed, lcgNext, randomSeed, unSeed)
import Sudoku.Grid (initCell, initGrid, modifyCell)
import Sudoku.Solver (solve)
import Sudoku.Types (Digit(..), Grid, Index(..), Position, blockOf, positions)

type Random = State Seed

-- | A solved grid used when no attempt could be solved.
fallbackGrid :: Grid
fallbackGrid = table <#> \row -> row <#> \d ->
  { value: Just d, isInitial: true }
  where
  table =
    [ [ D1, D2, D3, D4, D5, D6, D7, D8, D9 ]
    , [ D4, D5, D6, D7, D8, D9, D1, D2, D3 ]
    , [ D7, D8, D9, D1, D2, D3, D4, D5, D6 ]
    , [ D2, D3, D4, D5, D6, D7, D8, D9, D1 ]
    , [ D5, D6, D7, D8, D9, D1, D2, D3, D4 ]
    , [ D8, D9, D1, D2, D3, D4, D5, D6, D7 ]
    , [ D3, D4, D5, D6, D7, D8, D9, D1, D2 ]
    , [ D6, D7, D8, D9, D1, D2, D3, D4, D5 ]
    , [ D9, D1, D2, D3, D4, D5, D6, D7, D8 ]
    ]

-- | How many boards to try, and how many transitions each may spend.
attempts :: Int
attempts = 1

budget :: Int
budget = 1000

digits :: Array Digit
digits = enumFromTo bottom top

draw :: Random Int
draw = state \seed -> Tuple (unSeed seed) (lcgNext seed)

-- | Sorts the digits by a random key each.
shuffleDigits :: Random (Array Digit)
shuffleDigits = do
  keys <- traverse (const draw) digits
  pure (map snd (sortWith fst (zip keys digits)))

fillBlock :: Index -> Array Digit -> Grid -> Grid
fillBlock start values grid = foldl put grid (zip blockPositions values)
  where
  blockPositions = do
    row <- blockOf start
    col <- blockOf start
    pure { row, col }
  put g (Tuple pos d) =
    modifyCell pos _ { value = Just d, isInitial = true } g

-- | A grid with the three diagonal blocks filled. They share no row or
-- | column, so any fill is consistent.
generateDiagonalBlocks :: Random Grid
generateDiagonalBlocks = foldM
  (\grid start -> (\values -> fillBlock start values grid) <$> shuffleDigits)
  initGrid
  [ I0, I3, I6 ]

generateCompleteGrid :: Random Grid
generateCompleteGrid = do
  grids <- traverse (const generateDiagonalBlocks) (1 .. attempts)
  pure (fromMaybe fallbackGrid (findMap (hush <<< solve budget) grids))

-- | Three draws give 81 bits of 27 each; a position is picked when its bit
-- | is set.
generateRandomPositions :: Random (Array Position)
generateRandomPositions = do
  masks <- traverse (const draw) (1 .. 3)
  pure (map fst (filter snd (zip positions (concatMap bits masks))))
  where
  bits mask = (0 .. 26) <#> \i -> (mask `shr` i) `and` 1 == 1

removeCells :: Array Position -> Grid -> Grid
removeCells removed grid = foldl
  (\g pos -> modifyCell pos (const initCell) g)
  grid
  removed

generateInitialGrid :: Effect Grid
generateInitialGrid = evalState puzzle <$> randomSeed
  where
  puzzle = do
    complete <- generateCompleteGrid
    removed <- generateRandomPositions
    pure (removeCells removed complete)
