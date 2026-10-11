module Test.Sudoku.TypesSpec (spec) where

import Prelude

import Data.Array (elem, length, range)
import Data.Enum (class BoundedEnum, enumFromTo, fromEnum, toEnum)
import Data.Foldable (for_)
import Data.Maybe (Maybe(..))
import Sudoku.Types (Digit(..), Index(..), Position, blockOf, decode, encode, indices)
import Test.Spec (Spec, describe, it)
import Test.Spec.Assertions (shouldEqual)

-- | `fromEnum` must hand out exactly `expected`, in order, and `toEnum` must
-- | undo it. The instances are written by hand, so a swapped pair of cases
-- | would still type check.
boundedEnumLaws :: forall @a. BoundedEnum a => Show a => Array Int -> Spec Unit
boundedEnumLaws expected = do
  it "numbers the values in order" do
    map fromEnum (enumFromTo bottom top :: Array a) `shouldEqual` expected
  it "round-trips through toEnum" do
    for_ (enumFromTo bottom top :: Array a) \x ->
      toEnum (fromEnum x) `shouldEqual` Just x

spec :: Spec Unit
spec = do
  describe "Digit" do
    boundedEnumLaws @Digit (range 1 9)
    it "has no value outside 1..9" do
      (toEnum 0 :: Maybe Digit) `shouldEqual` Nothing
      (toEnum 10 :: Maybe Digit) `shouldEqual` Nothing

  describe "Index" do
    boundedEnumLaws @Index (range 0 8)
    it "has no value outside 0..8" do
      (toEnum (-1) :: Maybe Index) `shouldEqual` Nothing
      (toEnum 9 :: Maybe Index) `shouldEqual` Nothing

  describe "Position" do
    boundedEnumLaws @Position (range 0 80)

  describe "Codec Digit" do
    it "decodes 1..9" do
      map (\n -> decode (show n)) (range 1 9) `shouldEqual`
        map Just (enumFromTo D1 D9)
    it "rejects anything else" do
      for_ [ "0", "", "a", "10", " " ] \s ->
        (decode s :: Maybe Digit) `shouldEqual` Nothing
    it "round-trips through encode" do
      for_ (enumFromTo D1 D9 :: Array Digit) \d ->
        decode (encode d) `shouldEqual` Just d

  describe "blockOf" do
    it "returns the three indices of the block" do
      blockOf I0 `shouldEqual` [ I0, I1, I2 ]
      blockOf I4 `shouldEqual` [ I3, I4, I5 ]
      blockOf I8 `shouldEqual` [ I6, I7, I8 ]
    it "always contains the index itself" do
      for_ indices \i -> elem i (blockOf i) `shouldEqual` true
      for_ indices \i -> length (blockOf i) `shouldEqual` 3
