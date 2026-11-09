<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/hanami-dark.svg">
    <img src="./assets/hanami.svg" width="100%" alt="A pixel-art cherry blossom park drawn from my GitHub contributions: one sakura tree per month, a lawn tile per day, and cats napping under the busiest months.">
  </picture>
</p>

<p align="center">
  <sub>🌸 One tree per month · one lawn tile per day · cats nap under the three busiest months · the sprout hops on my best day.<br>Redrawn every day from my contribution calendar.</sub>
</p>

<!--
How this works
- `npm run update` fetches the contribution calendar and rebuilds assets/hanami.svg and its night twin hanami-dark.svg (plain Node, no dependencies).
- .github/workflows/update-banner.yml does that daily. It needs a repo secret named PROFILE_TOKEN:
  a personal access token (classic) with only the `read:user` scope, so private contributions are counted.
- `npm run drafts` rebuilds the other style explorations into drafts/ (open drafts/preview.html).
-->
