# GitHub Contribution Growth Graph

[![release](https://img.shields.io/github/v/release/qkitzero/github-contribution-growth-graph?logo=github)](https://github.com/qkitzero/github-contribution-growth-graph/releases)
[![Test](https://github.com/qkitzero/github-contribution-growth-graph/actions/workflows/test.yml/badge.svg)](https://github.com/qkitzero/github-contribution-growth-graph/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/qkitzero/github-contribution-growth-graph/graph/badge.svg)](https://codecov.io/gh/qkitzero/github-contribution-growth-graph)

Visualize your GitHub contribution journey and language usage over multiple years at a glance.

While GitHub's contribution graph shows daily activity, it's hard to see your cumulative growth over time. This service generates a dynamic growth graph that clearly displays your accumulated contributions and language statistics across years, perfect for showcasing your consistent effort on your profile. Only public repository contributions are included.

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&v=2026-03-13)](https://github.com/qkitzero/github-contribution-growth-graph)
[![GitHub Language Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/languages?user=qkitzero&v=2026-03-13)](https://github.com/qkitzero/github-contribution-growth-graph)

## Quick Start

### Contribution Graph

Add to your GitHub profile README:

```markdown
[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME)](https://github.com/qkitzero/github-contribution-growth-graph)
```

Customize with parameters:

```markdown
<!-- Dark theme, large size -->

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME&theme=dark&size=large)](https://github.com/qkitzero/github-contribution-growth-graph)

<!-- Only commits and PRs, purple theme -->

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME&types=commit,pr&theme=purple)](https://github.com/qkitzero/github-contribution-growth-graph)

<!-- Custom date range -->

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME&from=2020-01-01&to=2025-12-31)](https://github.com/qkitzero/github-contribution-growth-graph)
```

### Language Graph

```markdown
[![GitHub Language Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/languages?user=YOUR_USERNAME)](https://github.com/qkitzero/github-contribution-growth-graph)
```

Customize with parameters:

```markdown
<!-- Custom date range, small size -->

[![GitHub Language Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/languages?user=YOUR_USERNAME&from=2020-01-01&to=2025-12-31&size=small)](https://github.com/qkitzero/github-contribution-growth-graph)
```

## Contribution Graph Reference

### Parameters

| Parameter | Type   | Required | Description                                                                                              | Default    |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------------------------- | ---------- |
| `user`    | string | **Yes**  | GitHub username                                                                                          | -          |
| `from`    | string | No       | Start date (YYYY-MM-DD)                                                                                  | 1 year ago |
| `to`      | string | No       | End date (YYYY-MM-DD)                                                                                    | Today      |
| `theme`   | string | No       | Graph theme (see [Themes](#themes))                                                                      | `default`  |
| `size`    | string | No       | Graph size (see [Sizes](#sizes))                                                                         | `medium`   |
| `types`   | string | No       | Contribution types to display (comma-separated: `commit`, `issue`, `pr`, `review`). Example: `commit,pr` | All types  |

> **Contribution types:** `commit` (code commits), `issue` (issues opened), `pr` (pull requests opened), `review` (pull request reviews). Only contributions to public repositories are counted.

### Themes

Choose from various color themes to match your profile style:

| Theme     | Preview                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | ![default](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=default&size=small&v=2026-03-13) |
| `blue`    | ![blue](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=blue&size=small&v=2026-03-13)       |
| `red`     | ![red](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=red&size=small&v=2026-03-13)         |
| `green`   | ![green](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=green&size=small&v=2026-03-13)     |
| `purple`  | ![purple](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=purple&size=small&v=2026-03-13)   |
| `orange`  | ![orange](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=orange&size=small&v=2026-03-13)   |
| `pink`    | ![pink](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=pink&size=small&v=2026-03-13)       |
| `dark`    | ![dark](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=dark&size=small&v=2026-03-13)       |
| `light`   | ![light](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&theme=light&size=small&v=2026-03-13)     |

### Sizes

| Size     | Dimensions | Preview                                                                                                                     |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| `small`  | 600 x 300  | ![small](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&size=small&v=2026-03-13)   |
| `medium` | 800 x 400  | ![medium](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&size=medium&v=2026-03-13) |
| `large`  | 1000 x 500 | ![large](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=qkitzero&size=large&v=2026-03-13)   |

## Language Graph Reference

### Parameters

| Parameter | Type   | Required | Description                             | Default    |
| --------- | ------ | -------- | --------------------------------------- | ---------- |
| `user`    | string | **Yes**  | GitHub username                         | -          |
| `from`    | string | No       | Start date (YYYY-MM-DD)                 | 1 year ago |
| `to`      | string | No       | End date (YYYY-MM-DD)                   | Today      |
| `size`    | string | No       | Graph size (`small`, `medium`, `large`) | `medium`   |

> Language activity is measured by weighted commits — each commit is weighted by the language byte proportion of its repository. Only public repositories are included. Theme customization is not available for language graphs.

## Updating Your Graph

Graph images are cached for up to 7 days. To force a refresh, append a version parameter (e.g., today's date) to change the URL:

```markdown
[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graph/contributions?user=YOUR_USERNAME&v=2026-03-26)](https://github.com/qkitzero/github-contribution-growth-graph)
```

Since the URL differs, CDNs and browser caches treat it as a new resource, bypassing the cached version.
