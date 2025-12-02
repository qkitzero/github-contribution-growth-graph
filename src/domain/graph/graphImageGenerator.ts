import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { GraphData } from '../contribution/contribution';

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 400;

/**
 * Chart.jsを使用してグラフ画像を生成するクラス
 */
export class GraphImageGenerator {
  private chartJSNodeCanvas: ChartJSNodeCanvas;

  constructor(width: number = DEFAULT_WIDTH, height: number = DEFAULT_HEIGHT) {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
      },
    });
  }

  /**
   * グラフデータからPNG画像のBufferを生成
   */
  async generate(graphData: GraphData): Promise<Buffer> {
    const configuration = this.createChartConfiguration(graphData);
    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
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
