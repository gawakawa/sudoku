-- | A backtracking sudoku solver. It is the public side of the state machine in
-- | `Sudoku.Solver.Internal`.
module Sudoku.Solver
  ( Failure(..)
  , solve
  ) where

import Prelude

import Data.Either (Either(..))
import Data.Generic.Rep (class Generic)
import Data.Show.Generic (genericShow)
import Sudoku.Solver.Internal (Next(..), solution, start, step)
import Sudoku.Types (Grid)

-- | How a search ends without a solution. `TimedOut` says nothing about
-- | whether one exists.
data Failure = TimedOut | NoSolution

derive instance Eq Failure
derive instance Generic Failure _

instance Show Failure where
  show = genericShow

-- | Filled cells are kept as they are. Cells the search fills become initial.
solve :: Int -> Grid -> Either Failure Grid
solve spendable grid = go (start spendable grid)
  where
  go s = case step s of
    Continue s' -> go s'
    Finish solved -> Right (solution solved)
    Expire _ -> Left TimedOut
    Exhaust _ -> Left NoSolution
