<div align="right">
  <details>
    <summary>🌙</summary>
    <img src="./assets/hanami-dark.svg" width="100%" alt="Night version of the banner: the same cherry blossom park under a moon, with lanterns in the trees.">
  </details>
</div>

<p align="center">
  <img src="./assets/hanami.svg" width="100%" alt="A pixel-art cherry blossom park drawn from my GitHub contributions: one sakura tree per month, a lawn tile per day, and cats napping under the busiest months.">
</p>

<!--
How this works
- `npm run update` fetches the contribution calendar and rebuilds assets/hanami.svg and its night twin hanami-dark.svg (plain Node, no dependencies).
- .github/workflows/update-banner.yml does that daily. It needs a repo secret named PROFILE_TOKEN:
  a personal access token (classic) with only the `read:user` scope, so private contributions are counted.
- `npm run drafts` rebuilds the other style explorations into drafts/ (open drafts/preview.html).
-->
