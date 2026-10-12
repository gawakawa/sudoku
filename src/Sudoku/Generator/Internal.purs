-- | The pure stages of generation. `Sudoku.Generator` draws the random choices
-- | and feeds them to these.
module Sudoku.Generator.Internal
  ( fallbackGrid
  , fillDiagonal
  , completeGrid
  , removeCells
  ) where

import Prelude

import Data.Array (findMap, zip)
import Data.Either (hush)
import Data.Foldable (foldl)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Tuple (Tuple(..))
import Sudoku.Data.Board (Index(..), Position, blockOf, modifyCell)
import Sudoku.Data.Puzzle (Digit(..), Grid, initCell, initGrid)
import Sudoku.Solver (solve)

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

-- | Parameter: how many solver transitions each attempt may spend.
budget :: Int
budget = 1000

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

removeCells :: Array Position -> Grid -> Grid
removeCells removed grid = foldl
  (\g pos -> modifyCell pos (\_ -> initCell unit) g)
  grid
  removed
