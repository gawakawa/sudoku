module Test.Sudoku.Data.PuzzleSpec (spec) where

import Prelude

import Data.Array (any)
import Data.Array.NonEmpty (cons')
import Data.Enum (class BoundedEnum)
import Data.Foldable (all)
import Data.Identity (Identity(..))
import Data.Maybe (Maybe(..))
import Data.Newtype (unwrap)
import Data.Set as Set
import Sudoku.Data.Board (Position, getPeers, positions)
import Sudoku.Data.Puzzle (class Codec, Digit, Grid, decode, encode, hasConflict)
import Test.QuickCheck (Result(..), (<?>), (===))
import Test.QuickCheck.Arbitrary (arbitrary)
import Test.QuickCheck.Gen (Gen, elements, oneOf)
import Test.Spec (Spec, describe, it)
import Test.Spec.QuickCheck (quickCheck)
import Test.Sudoku.Gen (genBoard, genEnum, genPuzzle)
import Test.Sudoku.Rules (valueAt)

conflict :: Grid -> Position -> Boolean
conflict grid = unwrap <<< hasConflict (Identity <<< valueAt grid)

partnerConflicts :: Grid -> Position -> Boolean
partnerConflicts g p = any
  (\q -> q /= p && valueAt g q == valueAt g p && conflict g q)
  (Set.toUnfoldable (getPeers p))

-- | Strings near the ones `encode` produces, which `decode` must not accept
-- | unless they are exactly an encoding. Arbitrary strings alone would almost
-- | always decode to `Nothing` and check nothing. Adding to only one side keeps
-- | the near misses to 8 strings per value, so each comes up often.
genText :: forall @a. Codec a => BoundedEnum a => Gen String
genText = oneOf (cons' arbitrary [ prefixed, suffixed ])
  where
  prefixed = (\j x -> j <> encode x) <$> elements junk <*> genEnum @a
  suffixed = (\x j -> encode x <> j) <$> genEnum @a <*> elements junk
  junk = cons' "0" [ "+", " ", "1" ]

codecLaws :: forall @a. Codec a => BoundedEnum a => Show a => Spec Unit
codecLaws = do
  it "decodes what it encoded" do
    quickCheck do
      x <- genEnum @a
      pure (decode (encode x) === Just x)
  it "encodes back what it decoded" do
    quickCheck do
      s <- genText @a
      pure case decode s :: Maybe a of
        Nothing -> Success
        Just x -> encode x === s

spec :: Spec Unit
spec = do
  describe "Codec Digit" (codecLaws @Digit)
  describe "hasConflict" do
    it "is false everywhere on a board with no repeated digit" do
      quickCheck do
        g <- genPuzzle
        pure
          (not (any (conflict g) positions) <?> "a conflict on a valid board")
    it "holds for a cell only if a peer with the same digit holds it too" do
      quickCheck do
        g <- genBoard
        pure
          ( all (\p -> not (conflict g p) || partnerConflicts g p) positions
              <?> "a conflicting cell has no conflicting partner"
          )
