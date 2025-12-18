# GitHub Contribution Growth Graph

[![release](https://img.shields.io/github/v/release/qkitzero/github-contribution-growth-graph?logo=github)](https://github.com/qkitzero/github-contribution-growth-graph/releases)
[![Test](https://github.com/qkitzero/github-contribution-growth-graph/actions/workflows/test.yml/badge.svg)](https://github.com/qkitzero/github-contribution-growth-graph/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/qkitzero/github-contribution-growth-graph/graph/badge.svg)](https://codecov.io/gh/qkitzero/github-contribution-growth-graph)

Visualize your GitHub contribution journey over multiple years at a glance.

While GitHub's contribution graph shows daily activity, it's hard to see your cumulative growth over time. This service generates a dynamic growth graph that clearly displays your accumulated contributions across years, perfect for showcasing your consistent effort on your profile.

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero)](https://github.com/qkitzero/github-contribution-growth-graph)

## Usage

```markdown
[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME)](https://github.com/qkitzero/github-contribution-growth-graph)
```

### Query Parameters

| Parameter | Type   | Required | Description                             | Default    |
| --------- | ------ | -------- | --------------------------------------- | ---------- |
| `user`    | string | **Yes**  | GitHub username                         | -          |
| `from`    | string | No       | Start date (YYYY-MM-DD)                 | 1 year ago |
| `to`      | string | No       | End date (YYYY-MM-DD)                   | Today      |
| `theme`   | string | No       | Graph theme (see [Themes](#themes))     | `default`  |
| `size`    | string | No       | Graph size (`small`, `medium`, `large`) | `medium`   |

## Themes

Choose from various color themes to match your profile style:

| Theme     | Preview                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `default` | ![default](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=default&size=small) |
| `blue`    | ![blue](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=blue&size=small)       |
| `red`     | ![red](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=red&size=small)         |
| `green`   | ![green](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=green&size=small)     |
| `purple`  | ![purple](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=purple&size=small)   |
| `orange`  | ![orange](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=orange&size=small)   |
| `pink`    | ![pink](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=pink&size=small)       |
| `dark`    | ![dark](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=dark&size=small)       |
| `light`   | ![light](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=light&size=small)     |
