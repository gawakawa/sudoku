_: {
  perSystem =
    { ps, ... }:
    {
      checks.tests = ps.test.check { };
    };
}
