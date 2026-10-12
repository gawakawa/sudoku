_: {
  perSystem =
    {
      config,
      pkgs,
      ps,
      ps-bench,
      purs-nix,
      ...
    }:
    let
      devPackages =
        config.ciPackages
        ++ config.pre-commit.settings.enabledPackages
        ++ [
          (ps.command { })
          (ps-bench.command {
            name = "bench";
            bundle.module = "Bench.Main";
          })
          purs-nix.purescript
        ];
    in
    {
      devShells.default = pkgs.mkShell {
        buildInputs = devPackages;

        shellHook = ''
          ${config.pre-commit.shellHook}
        '';
      };
    };
}
