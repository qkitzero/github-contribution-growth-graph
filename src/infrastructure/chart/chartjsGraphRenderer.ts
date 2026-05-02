import {
  ChartConfiguration,
  ChartDataset,
  Plugin,
  ScriptableContext,
  ScriptableScaleContext,
} from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { GraphRenderer } from '../../application/graphRenderer';
import {
  AggregatedContributions,
  Contribution,
  Contributions,
  ContributionType,
} from '../../domain/contribution/contribution';
import { Size } from '../../domain/graph/size';
import { Theme } from '../../domain/graph/theme';
import { AggregatedLanguages, Language, Languages } from '../../domain/language/language';

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

type Gradient = { addColorStop(offset: number, color: string): void };
type CanvasCtx = {
  save(): void;
  restore(): void;
  fillStyle: string;
  fillRect(x: number, y: number, w: number, h: number): void;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): Gradient;
};

const CARD_PLUGIN: Plugin = {
  id: 'gcgChartCard',
  beforeDraw(chart) {
    const ctx = chart.ctx as unknown as CanvasCtx;
    const { chartArea } = chart;
    if (!chartArea) return;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
    ctx.restore();
  },
};

export class ChartjsGraphRenderer implements GraphRenderer {
  private static readonly CHART_DEFAULTS = {
    TENSION: 0.35,
    POINT_RADIUS: 0,
    BORDER_WIDTH: 2,
    DEVICE_PIXEL_RATIO: 2,
  } as const;

  private createCanvas(size: Size, theme: Theme): ChartJSNodeCanvas {
    return new ChartJSNodeCanvas({
      width: size.width,
      height: size.height,
      backgroundColour: theme.backgroundColor,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
        ChartJS.defaults.devicePixelRatio = ChartjsGraphRenderer.CHART_DEFAULTS.DEVICE_PIXEL_RATIO;
        ChartJS.defaults.font.family = FONT_FAMILY;
        ChartJS.defaults.font.size = 12;
        ChartJS.defaults.font.weight = 500;
      },
    });
  }

  async renderContributions(
    contributions: Contribution[],
    theme?: string,
    size?: string,
  ): Promise<Buffer> {
    const themeObj = new Theme(theme);
    const sizeObj = new Size(size);
    const canvas = this.createCanvas(sizeObj, themeObj);

    const contributionsCollection = new Contributions(contributions);

    if (contributionsCollection.isEmpty) {
      return this.generateEmptyChart(canvas);
    }

    const aggregated = contributionsCollection.aggregate();
    const periods = contributionsCollection.getAllPeriods(aggregated);
    const datasets = this.createContributionDatasets(
      contributionsCollection,
      aggregated,
      periods,
      themeObj,
    );

    const chartConfiguration = this.createChartConfiguration(
      periods,
      datasets,
      'Cumulative Contributions',
      themeObj,
    );

    return await canvas.renderToBuffer(chartConfiguration);
  }

  async renderLanguages(languages: Language[], theme?: string, size?: string): Promise<Buffer> {
    const themeObj = new Theme(theme);
    const sizeObj = new Size(size);
    const canvas = this.createCanvas(sizeObj, themeObj);

    const languagesCollection = new Languages(languages);

    if (languagesCollection.isEmpty) {
      return this.generateEmptyChart(canvas);
    }

    const aggregated = languagesCollection.aggregate();
    const periods = languagesCollection.getAllPeriods(aggregated);
    const datasets = this.createLanguageDatasets(languagesCollection, aggregated, periods);

    const chartConfiguration = this.createChartConfiguration(
      periods,
      datasets,
      'Cumulative Language Activity (weighted commits)',
      themeObj,
    );

    return await canvas.renderToBuffer(chartConfiguration);
  }

  private generateEmptyChart(canvas: ChartJSNodeCanvas): Promise<Buffer> {
    return canvas.renderToBuffer({
      type: 'line',
      data: { labels: [], datasets: [] },
      options: {
        plugins: {
          title: { display: true, text: 'No contributions found' },
        },
      },
    });
  }

  private createContributionDatasets(
    contributions: Contributions,
    aggregated: AggregatedContributions,
    periods: string[],
    theme: Theme,
  ): ChartDataset<'line'>[] {
    const orderedTypes = contributions.getOrderedTypes(aggregated);

    return orderedTypes.map((type: ContributionType) => {
      const periodData = aggregated.get(type)!;
      const color = theme.getColorForType(type);
      const cumulativeData = contributions.calculateCumulative(periodData, periods);

      return this.buildDataset(type, cumulativeData, color, 'contributions');
    });
  }

  private createLanguageDatasets(
    languages: Languages,
    aggregated: AggregatedLanguages,
    periods: string[],
  ): ChartDataset<'line'>[] {
    const orderedLangs = languages.getOrderedLanguages(aggregated);

    return orderedLangs.map((langName) => {
      const { color, data: periodData } = aggregated.get(langName)!;
      const cumulativeData = languages.calculateCumulative(periodData, periods);

      return this.buildDataset(langName, cumulativeData, color, 'languages');
    });
  }

  private buildDataset(
    label: string,
    data: number[],
    color: string,
    stack: string,
  ): ChartDataset<'line'> {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: this.makeAreaGradient(color),
      fill: true,
      tension: ChartjsGraphRenderer.CHART_DEFAULTS.TENSION,
      pointRadius: ChartjsGraphRenderer.CHART_DEFAULTS.POINT_RADIUS,
      borderWidth: ChartjsGraphRenderer.CHART_DEFAULTS.BORDER_WIDTH,
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
      stack,
    };
  }

  private makeAreaGradient(color: string) {
    return (ctx: ScriptableContext<'line'>) => {
      const c = ctx.chart.ctx as unknown as CanvasCtx;
      const { chartArea } = ctx.chart;
      if (!chartArea) return `${color}40`;
      const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      grad.addColorStop(0, `${color}B0`);
      grad.addColorStop(1, `${color}10`);
      return grad;
    };
  }

  private createChartConfiguration(
    labels: string[],
    datasets: ChartDataset<'line'>[],
    yAxisTitle: string,
    theme: Theme,
  ): ChartConfiguration {
    const gridColor = this.gridColor(theme);
    const axisLabelColor = this.axisLabelColor(theme);

    return {
      type: 'line',
      plugins: [CARD_PLUGIN],
      data: {
        labels,
        datasets,
      },
      options: {
        layout: { padding: { right: 8, left: 4, top: 8, bottom: 4 } },
        scales: {
          x: {
            title: { display: false, text: 'Period' },
            grid: { display: false },
            border: { display: false },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
              maxRotation: 0,
              color: axisLabelColor,
            },
          },
          y: {
            title: { display: false, text: yAxisTitle },
            beginAtZero: true,
            grid: {
              color: (ctx: ScriptableScaleContext) =>
                ctx.tick.value === 0 ? 'transparent' : gridColor,
            },
            border: { display: false },
            ticks: { color: axisLabelColor },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              padding: 12,
              color: axisLabelColor,
            },
          },
          title: { display: false },
        },
      },
    };
  }

  private gridColor(theme: Theme): string {
    const bg = theme.backgroundColor;
    if (bg === '#000000') return 'rgba(255, 255, 255, 0.08)';
    return 'rgba(0, 0, 0, 0.08)';
  }

  private axisLabelColor(theme: Theme): string {
    const bg = theme.backgroundColor;
    if (bg === '#000000') return '#8b949e';
    return '#656d76';
  }
}
