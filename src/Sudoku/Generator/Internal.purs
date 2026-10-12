-- | Puzzle generation. `Sudoku.Generator` builds the public API on top of it,
-- | and the tests of the generator import this module. Other modules should
-- | use `Sudoku.Generator`.
-- |
-- | Only the choices that need randomness, the digits of the diagonal blocks
-- | and the cells to empty, are drawn; the rest is pure.
module Sudoku.Generator.Internal
  ( fallbackGrid
  , fillDiagonal
  , completeGrid
  , removeCells
  , generateInitialGrid
  ) where

import Prelude

import Control.Monad.State (State, evalState, state)
import Data.Array (concatMap, filter, findMap, sortWith, zip, (..))
import Data.Either (hush)
import Data.Enum (enumFromTo)
import Data.Foldable (foldl)
import Data.Int.Bits (and, shr)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (traverse)
import Data.Tuple (Tuple(..), fst, snd)
import Data.Unfoldable (replicateA)
import Effect (Effect)
import Random.LCG (Seed, lcgNext, randomSeed, unSeed)
import Sudoku.Data.Board (Index(..), Position, blockOf, modifyCell, positions)
import Sudoku.Data.Puzzle (Digit(..), Grid, initCell, initGrid)
import Sudoku.Solver (solve)

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

-- | Parameter: how many boards to try before falling back to `fallbackGrid`.
attempts :: Int
attempts = 1

-- | Parameter: how many solver transitions each attempt may spend.
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

-- | A grid with the three diagonal blocks filled with the given digits. They
-- | share no row or column, so any fill is consistent.
fillDiagonal :: Array (Array Digit) -> Grid
fillDiagonal blocks = foldl
  (\grid (Tuple start values) -> fillBlock start values grid)
  (initGrid unit)
  (zip [ I0, I3, I6 ] blocks)

-- | The first of the grids that can be solved, solved.
completeGrid :: Array Grid -> Grid
completeGrid grids = fromMaybe fallbackGrid
  (findMap (hush <<< solve budget) grids)

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
  (\g pos -> modifyCell pos (\_ -> initCell unit) g)
  grid
  removed

generateInitialGrid :: Effect Grid
generateInitialGrid = evalState puzzle <$> randomSeed
  where
  puzzle = do
    blocks <- replicateA attempts (replicateA 3 shuffleDigits)
    removed <- generateRandomPositions
    pure (removeCells removed (completeGrid (fillDiagonal <$> blocks)))
