import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Contribution } from '../contribution/contribution';

export class Graph {
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  private borderColor: string;

  constructor(
    width: number = 800,
    height: number = 400,
    backgroundColour: string = 'transparent',
    borderColor: string = '#4bc0c0ff',
  ) {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
    this.borderColor = borderColor;
  }

  async generate(contributions: Contribution[]): Promise<Buffer> {
    const sorted = contributions.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningTotal = 0;
    const totals = sorted.map((c) => {
      runningTotal += c.count;
      return {
        date: c.date,
        total: runningTotal,
      };
    });

    const labels = totals.map((c) =>
      c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );

    const values = totals.map((c) => c.total);

    const chartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cumulative Contributions',
            data: values,
            borderColor: this.borderColor,
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: {
            title: { display: true, text: 'Cumulative Contributions' },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'GitHub Contribution Growth' },
        },
      },
    };

    return await this.chartJSNodeCanvas.renderToBuffer(chartConfiguration);
  }
}
