-- | A panel that polls the counts a `counting` metrics keeps and shows them,
-- | with a heatmap of how often each cell was updated.
module Sudoku.UI.Component.MetricsPanel
  ( Props
  , metricsPanel
  ) where

import Prelude

import Data.Enum (fromEnum)
import Data.Foldable (foldl)
import Data.Int (floor, toNumber)
import Data.Map as Map
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (traverse_)
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Ref as Ref
import Solid.Component (Component, component)
import Solid.DOM.HTML as H
import Solid.JSX (JSX)
import Solid.Lifecycle (onSettled)
import Solid.Setup (liftSetup)
import Solid.Signal (Accessor, createSignalWith, eqEquality, set)
import Sudoku.Data.Board (Position, indices)
import Sudoku.UI.Metrics (Snapshot, totalCellUpdates)
import Web.HTML (window)
import Web.HTML.Window (cancelAnimationFrame, requestAnimationFrame)

type Props = { snapshot :: Effect Snapshot }

metricsPanel :: Component Props
metricsPanel = component \props -> do
  initial <- liftSetup props.snapshot
  snap /\ setSnap <- createSignalWith { equals: eqEquality } initial

  -- Reads the counts once per animation frame while the panel is shown.
  onSettled do
    win <- window
    frame <- Ref.new Nothing
    let
      tick :: Unit -> Effect Unit
      tick _ = do
        props.snapshot >>= set setSnap
        schedule unit

      schedule :: Unit -> Effect Unit
      schedule _ = do
        id <- requestAnimationFrame (tick unit) win
        Ref.write (Just id) frame
    schedule unit
    pure (Ref.read frame >>= traverse_ (\id -> cancelAnimationFrame id win))

  let
    maxCount :: Accessor Int
    maxCount = foldl max 0 <<< _.cellUpdates <$> snap

    countAt :: Position -> Accessor Int
    countAt pos = fromMaybe 0 <<< Map.lookup pos <<< _.cellUpdates <$> snap

    -- White for no updates, red for the most updated cell.
    background :: Position -> Accessor String
    background pos = shade <$> countAt pos <*> maxCount
      where
      shade count max
        | max == 0 = ""
        | otherwise =
            let
              level = show (255 - floor (toNumber count / toNumber max * 255.0))
            in
              "background-color: rgb(255, " <> level <> ", " <> level <> ")"

    heatmapCell :: Position -> JSX
    heatmapCell pos = H.div
      { class:
          "w-3 h-3 md:w-4 md:h-4 flex items-center justify-center text-[6px] md:text-[8px] bg-gray-100"
      , style: background pos
      , title:
          ( \count -> "Cell " <> show (fromEnum pos.row) <> ","
              <> show (fromEnum pos.col)
              <> ": "
              <> show count
              <> " updates"
          )
            <$> countAt pos
      }
      ((\count -> if count > 0 then show count else "") <$> countAt pos)

    stat :: String -> (Snapshot -> Int) -> JSX
    stat label field = H.div { class: "flex justify-between" }
      [ H.span { class: "text-gray-600" } label
      , H.span { class: "font-semibold" } (show <<< field <$> snap)
      ]

  pure $ H.div
    { class:
        "md:fixed md:bottom-4 md:right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 md:p-4 m-4 md:m-0 text-xs md:text-sm font-mono z-50 w-auto max-w-sm mx-auto md:max-w-none md:min-w-64"
    }
    [ H.h2 { class: "text-base font-bold mb-3 text-gray-800" }
        "Performance Metrics"
    , H.div { class: "space-y-1 mb-4" }
        [ stat "App Renders:" _.appRenders
        , stat "Grid Renders:" _.gridRenders
        , stat "Total Cell Updates:" totalCellUpdates
        , stat "Grid Updates:" _.gridUpdates
        ]
    , H.div { class: "mb-3" }
        [ H.h3 { class: "text-xs font-semibold text-gray-600 mb-2" }
            "Cell Update Heatmap"
        , H.div { class: "grid grid-cols-9 gap-px bg-gray-300 p-px" }
            do
              row <- indices
              col <- indices
              pure (heatmapCell { row, col })
        ]
    ]
