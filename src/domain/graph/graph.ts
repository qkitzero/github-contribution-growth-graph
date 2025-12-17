import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Contribution } from '../contribution/contribution';
import { Size } from './size';
import { Theme } from './theme';

export class Graph {
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  private theme: Theme;
  private size: Size;

  constructor(theme?: string, size?: string) {
    this.theme = new Theme(theme);
    this.size = new Size(size);
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: this.size.width,
      height: this.size.height,
      backgroundColour: this.theme.backgroundColor,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
  }

  async generate(contributions: Contribution[]): Promise<Buffer> {
    if (contributions.length === 0) {
      return this.chartJSNodeCanvas.renderToBuffer({
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
          plugins: {
            title: { display: true, text: 'No contributions found' },
          },
        },
      });
    }

    const byType = new Map<string, Contribution[]>();

    for (const c of contributions) {
      if (!byType.has(c.type)) {
        byType.set(c.type, []);
      }
      byType.get(c.type)!.push(c);
    }

    const dates = Array.from(new Set(contributions.map((c) => c.date.getTime())))
      .sort((a, b) => a - b)
      .map((t) => new Date(t));

    type SeriesPoint = { date: Date; total: number };

    const seriesByType = new Map<string, SeriesPoint[]>();

    for (const [type, list] of byType) {
      const sorted = [...list].sort((a, b) => a.date.getTime() - b.date.getTime());

      let runningTotal = 0;
      const result: SeriesPoint[] = [];

      for (const d of dates) {
        const todays = sorted.filter((c) => c.date.getTime() === d.getTime());
        const dailySum = todays.reduce((s, c) => s + c.count, 0);
        runningTotal += dailySum;

        result.push({ date: d, total: runningTotal });
      }

      seriesByType.set(type, result);
    }

    const labels = dates.map((d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}/${month}`;
    });

    const typeOrder = ['commit', 'issue', 'pull_request', 'pull_request_review'];
    const datasets = typeOrder
      .filter((type) => seriesByType.has(type))
      .map((type) => {
        const series = seriesByType.get(type)!;
        const color = this.theme.getColorForType(type);
        return {
          label: type,
          data: series.map((p) => p.total),
          borderColor: color,
          backgroundColor: `${color}80`,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          stack: 'contributions',
        };
      });

    const chartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        scales: {
          x: {
            title: { display: false, text: 'Date' },
          },
          y: {
            title: { display: false, text: 'Cumulative Contributions' },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'GitHub Contribution Growth Graph' },
        },
      },
    };

    return await this.chartJSNodeCanvas.renderToBuffer(chartConfiguration);
  }
}
