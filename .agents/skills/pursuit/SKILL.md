---
name: pursuit
description: "Use whenever you or the user, while writing PureScript, want to find a function or package — e.g. 'PureScript で〜する関数を探して', '〜するパッケージない?', '〜はどのモジュールにある?', 'find a PureScript function for …'. Searches Pursuit (by type when possible), falling back to Hoogle."
---

# Pursuit

Both Pursuit and Hoogle accept a name, a keyword, or a type signature as the
query. When you know the shape of the function you need, query by type first,
since a guessed name may not exist. Requires network.

## Pursuit

```sh
q='(a -> Boolean) -> Array a -> Maybe a'
ax "https://pursuit.purescript.org/search?q=$(jq -rn --arg q "$q" '$q|@uri')" -H 'accept: application/json' --body \
  | jq -r '.[] | "\(.package)@\(.version)  \(.info.module).\(.info.title) :: \(.info.typeText)"'
```

- Ranking is unreliable: read every hit; prefer core packages (`prelude`,
  `arrays`, `foldable-traversable`, …).
- No hit: generalize (`Array` → `f` with `Functor`/`Foldable`) or swap argument
  order.

## Hoogle fallback

Translate the type to Haskell and search Hoogle, then search Pursuit by the name
you find.

```sh
q='(a -> Bool) -> [a] -> Maybe a'
ax "https://hoogle.haskell.org/?hoogle=$(jq -rn --arg q "$q" '$q|@uri')" 'div.result' --row 'item=.ans, from=.from'
```

`Boolean`→`Bool`, `Array a`→`[a]`, `Number`→`Double`, `Effect`→`IO`,
`Unit`→`()`, `Tuple a b`→`(a, b)`; drop records/rows.

## Never guess

If nothing is found, say so instead of inventing an import.
