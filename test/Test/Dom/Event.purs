module Test.Dom.Event (press) where

import Prelude

import Effect (Effect)
import Web.DOM.Element (Element)

-- | Presses a key on an input.
foreign import press :: String -> Element -> Effect Unit
