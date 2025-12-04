# GitHub Contribution Growth Graph

A service that generates dynamic GitHub contribution growth graphs as PNG images.  
This service fetches GitHub contribution data and visualizes it as a customizable chart.

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero)](https://github.com/qkitzero/github-contribution-growth-graph)

## Usage

```markdown
[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero)](https://github.com/qkitzero/github-contribution-growth-graph)
```

### Query Parameters

| Parameter | Type   | Required | Description             | Default    |
| --------- | ------ | -------- | ----------------------- | ---------- |
| `user`    | string | Yes      | GitHub username         | -          |
| `from`    | string | No       | Start date (YYYY-MM-DD) | 1 year ago |
| `to`      | string | No       | End date (YYYY-MM-DD)   | Today      |
| `theme`   | string | No       | Graph theme             | default    |
| `size`    | string | No       | Graph size              | medium     |

### Examples

```markdown
<!-- Custom date range -->

[![Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero&from=2024-01-01&to=2024-12-31)](https://github.com/qkitzero/github-contribution-growth-graph)

<!-- Custom colors and size -->

[![Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero&bg=white&color=red&width=1000&height=500)](https://github.com/qkitzero/github-contribution-growth-graph)
```
