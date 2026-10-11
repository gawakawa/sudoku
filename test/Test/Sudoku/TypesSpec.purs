module Test.Sudoku.TypesSpec (spec) where

import Prelude

import Data.Array.NonEmpty (cons')
import Data.Enum (class BoundedEnum)
import Data.Maybe (Maybe(..))
import Sudoku.Types (class Codec, Digit, Index, decode, encode)
import Test.QuickCheck (Result(..), (===))
import Test.QuickCheck.Arbitrary (arbitrary)
import Test.QuickCheck.Gen (Gen, elements, oneOf)
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck, quickCheck')
import Test.Sudoku.Gen (genEnum)

-- | Strings near the ones `encode` produces, which `decode` must not accept
-- | unless they are exactly an encoding. Arbitrary strings alone would almost
-- | always decode to `Nothing` and check nothing.
genText :: forall @a. Codec a => BoundedEnum a => Gen String
genText = oneOf (cons' arbitrary [ affixed ])
  where
  affixed = do
    x <- genEnum @a
    before <- elements junk
    after <- elements junk
    pure (before <> encode x <> after)
  junk = cons' "" [ "0", "+", " ", "1" ]

codecLaws :: forall @a. Codec a => BoundedEnum a => Show a => Spec Unit
codecLaws = do
  it "decodes what it encoded" do
    quickCheck do
      x <- genEnum @a
      pure (decode (encode x) === Just x)
  it "encodes back what it decoded" do
    -- Only about 1 in 50 samples is one particular affixed string
    quickCheck' 1000 do
      s <- genText @a
      pure case decode s :: Maybe a of
        Nothing -> Success
        Just x -> encode x === s

spec :: Spec Unit
spec = do
  describe "Codec Digit" (codecLaws @Digit)
  describe "Codec Index" (codecLaws @Index)
