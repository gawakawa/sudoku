{ inputs, flake-parts-lib, ... }:
{
  options.perSystem = flake-parts-lib.mkPerSystemOption (
    { lib, ... }:
    {
      options.ciPackages = lib.mkOption {
        type = lib.types.listOf lib.types.package;
        default = [ ];
        description = "Packages for CI environment";
      };
    }
  );

  config.perSystem =
    { config, system, ... }:
    let
      pkgs = import inputs.nixpkgs { inherit system; };

      purs-nix = inputs.purs-nix { inherit system; };

      node_modules =
        pkgs.importNpmLock.buildNodeModules {
          npmRoot = ../.;
          nodejs = pkgs.nodejs_24;
        }
        + /node_modules;

      # purs-solid is not in the registry. Its FFI imports solid-js / @solidjs/web,
      # so every module doing so needs node_modules linked in.
      purs-solid = purs-nix.build {
        name = "purs-solid";
        src.git = {
          repo = "https://github.com/aquarazorda/purs-solid.git";
          rev = "17a163a651b938f69ab8f68290db2bed892580f2";
        };
        info = {
          version = "0.1.0";
          dependencies = [
            "aff"
            "aff-promise"
            "argonaut-core"
            "arraybuffer-types"
            "arrays"
            "dom-indexed"
            "effect"
            "either"
            "exceptions"
            "foreign-object"
            "functions"
            "maybe"
            "media-types"
            "nullable"
            "prelude"
            "strings"
            "tailrec"
            "tuples"
            "type-equality"
            "unsafe-coerce"
            "web-clipboard"
            "web-dom"
            "web-events"
            "web-fetch"
            "web-html"
            "web-pointerevents"
            "web-streams"
            "web-touchevents"
            "web-uievents"
            "web-xhr"
          ];
        };
      };

      with-solid =
        package: modules:
        pkgs.lib.recursiveUpdate package {
          purs-nix-info.foreign = pkgs.lib.genAttrs modules (_: {
            inherit node_modules;
          });
        };

      dependencies = [
        "arrays"
        "control"
        "effect"
        "either"
        "enums"
        "foldable-traversable"
        "lazy"
        "lcg"
        "lists"
        "maybe"
        "ordered-collections"
        "prelude"
        "refs"
        "transformers"
        "tuples"

        (with-solid purs-solid [
          "Solid.Action"
          "Solid.Async"
          "Solid.Component"
          "Solid.Context"
          "Solid.Errors"
          "Solid.Internal.Store"
          "Solid.Internal.View"
          "Solid.Lifecycle"
          "Solid.Owner"
          "Solid.Reactivity"
          "Solid.Root"
          "Solid.Signal"
          "Solid.Store"
          "Solid.Testing"
          "Solid.Utility"
          "Solid.Web"
        ])
      ];

      test-dependencies = [
        "aff"
        "quickcheck"
        "spec"
        "spec-node"
        "spec-quickcheck"
        "strings"
      ];

      ps = purs-nix.purs {
        inherit dependencies test-dependencies;
        dir = ./..;
      };
    in
    {
      _module.args = {
        inherit
          pkgs
          ps
          purs-nix
          ;
      };

      ciPackages = [ pkgs.nodejs_24 ];

      packages = {
        default = ps.output { };
        # `purs-nix test` compiles test/ too, which the DOM tests need
        purs-nix = ps.command { };
        ci = pkgs.buildEnv {
          name = "ci";
          paths = config.ciPackages;
        };
      };
    };
}
