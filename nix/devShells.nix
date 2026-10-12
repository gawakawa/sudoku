_: {
  perSystem =
    {
      config,
      pkgs,
      ps,
      purs-nix,
      ...
    }:
    let
      devPackages =
        config.ciPackages
        ++ config.pre-commit.settings.enabledPackages
        ++ [
          (ps.command { })
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
