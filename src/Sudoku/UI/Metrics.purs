-- | Counts of what the UI did, reported through a `Metrics` the components
-- | receive. `noop` ignores every report; `counting` keeps the counts.
module Sudoku.UI.Metrics
  ( Metrics
  , Snapshot
  , noop
  , counting
  , totalCellUpdates
  ) where

import Prelude

import Data.Foldable (sum)
import Data.Map (Map)
import Data.Map as Map
import Effect (Effect)
import Effect.Ref as Ref
import Sudoku.Data.Board (Position)

type Metrics =
  { cellUpdated :: Position -> Effect Unit
  , appRendered :: Effect Unit
  , gridRendered :: Effect Unit
  , gridUpdated :: Effect Unit
  }

type Snapshot =
  { cellUpdates :: Map Position Int
  , appRenders :: Int
  , gridRenders :: Int
  , gridUpdates :: Int
  }

noop :: Metrics
noop =
  { cellUpdated: \_ -> pure unit
  , appRendered: pure unit
  , gridRendered: pure unit
  , gridUpdated: pure unit
  }

counting :: Effect { metrics :: Metrics, snapshot :: Effect Snapshot }
counting = do
  ref <- Ref.new
    { cellUpdates: Map.empty
    , appRenders: 0
    , gridRenders: 0
    , gridUpdates: 0
    }
  pure
    { metrics:
        { cellUpdated: \pos -> Ref.modify_
            (\s -> s { cellUpdates = Map.insertWith (+) pos 1 s.cellUpdates })
            ref
        , appRendered: Ref.modify_ (\s -> s { appRenders = s.appRenders + 1 })
            ref
        , gridRendered: Ref.modify_
            (\s -> s { gridRenders = s.gridRenders + 1 })
            ref
        , gridUpdated: Ref.modify_
            (\s -> s { gridUpdates = s.gridUpdates + 1 })
            ref
        }
    , snapshot: Ref.read ref
    }

totalCellUpdates :: Snapshot -> Int
totalCellUpdates s = sum s.cellUpdates
