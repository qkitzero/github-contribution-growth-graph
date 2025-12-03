import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export type GraphData = {
  labels: string[];
  values: number[];
};

export class Graph {
  private chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor(width: number = 800, height: number = 400) {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
  }

  async generate(graphData: GraphData): Promise<Buffer> {
    const chartConfiguration = this.createChartConfiguration(graphData);
    return await this.chartJSNodeCanvas.renderToBuffer(chartConfiguration);
  }

  private createChartConfiguration(graphData: GraphData): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: graphData.labels,
        datasets: [
          {
            label: 'Cumulative Contributions',
            data: graphData.values,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Cumulative Contributions',
            },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'GitHub Contribution Growth',
          },
        },
      },
    };
  }
}
