-- | A random puzzle generator. It is the public side of
-- | `Sudoku.Generator.Internal`.
module Sudoku.Generator
  ( module Sudoku.Generator.Internal
  ) where

import Sudoku.Generator.Internal (generateInitialGrid)
