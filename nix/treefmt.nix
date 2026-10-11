{ inputs, ... }:
{
  perSystem =
    { system, lib, ... }:
    let
      # ps-tools bundles purs-tidy's worker entry with bundle-module, so it never
      # calls main(): workers exit at once and the pool dies with "Worker exited: 0".
      # https://github.com/purs-nix/purescript-tools/blob/913348dfc63faf105485e492fec0a66bed8d15ab/purs-tidy.nix#L43
      broken = "bundle-module -p node -t bundle/Bin.Worker";
      purs-tidy = inputs.ps-tools.legacyPackages.${system}.for-0_15.purs-tidy.overrideAttrs (old: {
        buildPhase =
          lib.throwIfNot (lib.hasInfix broken old.buildPhase)
            "purs-tidy: upstream buildPhase changed; recheck this override"
            (builtins.replaceStrings [ broken ] [ "bundle-app -p node -t bundle/Bin.Worker" ] old.buildPhase);
      });
    in
    {
      treefmt.programs = {
        nixfmt = {
          enable = true;
          includes = [ "*.nix" ];
        };
        oxfmt = {
          enable = true;
          includes = [
            "*.json"
            "*.jsonc"
            "*.json5"
            "*.md"
            "*.mdx"
            "*.yaml"
            "*.yml"
            "*.js"
            "*.mjs"
            "*.ts"
            "*.css"
          ];
          # oxfmt ignores lockfiles and errors when a batch contains only them
          excludes = [ "package-lock.json" ];
        };
      };

      treefmt.settings.formatter.purs-tidy = {
        command = lib.getExe' purs-tidy "purs-tidy";
        options = [ "format-in-place" ];
        includes = [ "*.purs" ];
      };
    };
}
