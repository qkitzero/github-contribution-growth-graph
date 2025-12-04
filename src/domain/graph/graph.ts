import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Contribution } from '../contribution/contribution';

const COLORS: Record<string, string> = {
  blue: '#4bc0c0ff',
  red: '#ff4444ff',
  green: '#36a64fff',
  purple: '#9966ffff',
  orange: '#ff9933ff',
  pink: '#ff6b9dff',
};

export class Graph {
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  private borderColor: string;

  constructor(
    width: number = 800,
    height: number = 400,
    bgColor: string = 'transparent',
    borderColor: string = 'blue',
  ) {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: bgColor,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
    this.borderColor = COLORS[borderColor] || COLORS.blue;
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
            borderColor: this.borderColor,
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: { display: false, text: 'Date' },
            ticks: {
              autoSkip: false,
              callback: function (value, index, ticks) {
                const label = this.getLabelForValue(index);
                if (index === 0) return label;
                const prevLabel = this.getLabelForValue(index - 1);
                if (label === prevLabel) return '';
                return label;
              },
            },
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
