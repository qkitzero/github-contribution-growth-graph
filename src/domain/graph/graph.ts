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
    // const sorted = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime());

    // let runningTotal = 0;
    // const totals = sorted.map((c) => {
    //   runningTotal += c.count;
    //   return {
    //     date: c.date,
    //     total: runningTotal,
    //   };
    // });

    // const labels = totals.map((c) => {
    //   const d = c.date;
    //   const year = d.getFullYear();
    //   const month = String(d.getMonth() + 1).padStart(2, '0');
    //   return `${year}/${month}`;
    // });

    // const values = totals.map((c) => c.total);

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

    const typeColors: Record<string, string> = {
      issue: '#4f46e5',
      pull_request: '#16a34a',
      pull_request_review: '#f59e0b',
      repository: '#f5380b',
      calender: '#562358',
    };

    const datasets = Array.from(seriesByType.entries()).map(([type, series]) => ({
      label: type,
      data: series.map((p) => p.total),
      borderColor: typeColors[type] ?? '#999',
      backgroundColor: `${typeColors[type] ?? '#999'}80`,
      fill: true,
      tension: 0.1,
      pointRadius: 0,
      stack: 'contributions',
    }));

    const chartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets,
        // datasets: [
        //   {
        //     label: 'Cumulative Contributions',
        //     data: values,
        //     borderColor: this.theme.lineColor,
        //     backgroundColor: `${this.theme.lineColor}50`,
        //     fill: true,
        //     tension: 0.1,
        //     pointRadius: 0,
        //   },
        // ],
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
