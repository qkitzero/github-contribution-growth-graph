# GitHub Contribution Growth Graph

A service that generates dynamic GitHub contribution growth graphs as PNG images.  
This service fetches GitHub contribution data and visualizes it as a customizable chart.

[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero)](https://github.com/qkitzero/github-contribution-growth-graph)

## Usage

```markdown
[![GitHub Contribution Growth Graph](https://github-contribution-growth-graph.qkitzero.xyz/graphs?user=qkitzero)](https://github.com/qkitzero/github-contribution-growth-graph)
```

### Query Parameters

| Parameter | Type   | Required | Description                               | Default    |
| --------- | ------ | -------- | ----------------------------------------- | ---------- |
| `user`    | string | **Yes**  | GitHub username                           | -          |
| `from`    | string | No       | Start date (YYYY-MM-DD)                   | 1 year ago |
| `to`      | string | No       | End date (YYYY-MM-DD)                     | Today      |
| `theme`   | string | No       | Graph theme (`red`, `green`, `dark`, ...) | `default`  |
| `size`    | string | No       | Graph size (`small`, `medium`, `large`)   | `medium`   |
