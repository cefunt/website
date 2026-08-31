(() => {
  const SUPABASE_URL = "https://ftrdhlstgljliuqjuovn.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_L2D3J0SzyP0nRR5aWE5Ucg_hUth7la_";

  const configured =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PEGA_AQUI") &&
    SUPABASE_PUBLISHABLE_KEY &&
    !SUPABASE_PUBLISHABLE_KEY.includes("PEGA_AQUI");

  window.CEFUNT_SUPABASE_CONFIGURED = configured;

  window.CEFUNT_SUPABASE =
    configured && window.supabase
      ? window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        )
      : null;
})();