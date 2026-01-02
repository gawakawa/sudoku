{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    mcp-servers-nix.url = "github:natsukium/mcp-servers-nix";
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];

      imports = [ inputs.treefmt-nix.flakeModule ];

      perSystem =
        {
          pkgs,
          system,
          lib,
          ...
        }:
        let
          ciPackages = with pkgs; [
            deno
            nodejs_24
          ];

          devPackages =
            ciPackages
            ++ (with pkgs; [
              # Additional development tools can be added here
            ]);

          mcpConfig = inputs.mcp-servers-nix.lib.mkConfig pkgs {
            programs = {
              nixos.enable = true;
            };
            settings.servers.chrome-devtools = {
              command = "${pkgs.lib.getExe' pkgs.nodejs_24 "npx"}";
              args = [
                "-y"
                "chrome-devtools-mcp@latest"
                "--executablePath"
                "${pkgs.lib.getExe pkgs.google-chrome}"
              ];
              env = {
                PATH = "${pkgs.nodejs_24}/bin:${pkgs.bash}/bin";
              };
            };
          };
        in
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [ "google-chrome" ];
          };

          packages = {
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciPackages;
            };

            mcp-config = mcpConfig;
          };

          devShells.default = pkgs.mkShell {
            buildInputs = devPackages;

            shellHook = ''
              cat ${mcpConfig} > .mcp.json
              echo "Generated .mcp.json"
            '';
          };

          treefmt = {
            programs = {
              nixfmt.enable = true;
              deno = {
                enable = true;
                excludes = [ "node_modules/*" ];
              };
            };
          };
        };
    };
}
