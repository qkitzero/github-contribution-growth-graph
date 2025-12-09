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
    const sorted = [...contributions].sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningTotal = 0;
    const totals = sorted.map((c) => {
      runningTotal += c.count;
      return {
        date: c.date,
        total: runningTotal,
      };
    });

    const labels = totals.map((c) => {
      const d = c.date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}/${month}`;
    });

    const values = totals.map((c) => c.total);

    const chartConfiguration: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cumulative Contributions',
            data: values,
            borderColor: this.theme.lineColor,
            backgroundColor: `${this.theme.lineColor}50`,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
          },
        ],
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
