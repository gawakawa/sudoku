_: {
  perSystem = _: {
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
}
