import { ChartConfiguration, ChartDataset } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {
  AggregatedContributions,
  Contribution,
  Contributions,
  ContributionType,
} from '../contribution/contribution';
import { AggregatedLanguages, Language, Languages } from '../language/language';
import { Size } from './size';
import { Theme } from './theme';

export class Graph {
  private static readonly CHART_DEFAULTS = {
    TENSION: 0.1,
    POINT_RADIUS: 0,
    BACKGROUND_ALPHA: '80',
  } as const;

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

  async generateFromContributions(contributions: Contribution[]): Promise<Buffer> {
    const contributionsCollection = new Contributions(contributions);

    if (contributionsCollection.isEmpty) {
      return this.generateEmptyChart();
    }

    const aggregated = contributionsCollection.aggregate();
    const periods = contributionsCollection.getAllPeriods(aggregated);
    const datasets = this.createContributionDatasets(contributionsCollection, aggregated, periods);

    const chartConfiguration = this.createChartConfiguration(
      periods,
      datasets,
      'GitHub Contribution Growth Graph',
      'Cumulative Contributions',
    );

    return await this.chartJSNodeCanvas.renderToBuffer(chartConfiguration);
  }

  async generateFromLanguages(languages: Language[]): Promise<Buffer> {
    const languagesCollection = new Languages(languages);

    if (languagesCollection.isEmpty) {
      return this.generateEmptyChart();
    }

    const aggregated = languagesCollection.aggregate();
    const periods = languagesCollection.getAllPeriods(aggregated);
    const datasets = this.createLanguageDatasets(languagesCollection, aggregated, periods);

    const chartConfiguration = this.createChartConfiguration(
      periods,
      datasets,
      'GitHub Language Growth Graph',
      'Cumulative Code Size (bytes)',
    );

    return await this.chartJSNodeCanvas.renderToBuffer(chartConfiguration);
  }

  private generateEmptyChart(): Promise<Buffer> {
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

  private createContributionDatasets(
    contributions: Contributions,
    aggregated: AggregatedContributions,
    periods: string[],
  ): ChartDataset<'line'>[] {
    const orderedTypes = contributions.getOrderedTypes(aggregated);

    return orderedTypes.map((type: ContributionType) => {
      const periodData = aggregated.get(type)!;
      const color = this.theme.getColorForType(type);
      const cumulativeData = contributions.calculateCumulative(periodData, periods);

      return {
        label: type,
        data: cumulativeData,
        borderColor: color,
        backgroundColor: `${color}${Graph.CHART_DEFAULTS.BACKGROUND_ALPHA}`,
        fill: true,
        tension: Graph.CHART_DEFAULTS.TENSION,
        pointRadius: Graph.CHART_DEFAULTS.POINT_RADIUS,
        stack: 'contributions',
      };
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

      return {
        label: langName,
        data: cumulativeData,
        borderColor: color,
        backgroundColor: `${color}${Graph.CHART_DEFAULTS.BACKGROUND_ALPHA}`,
        fill: true,
        tension: Graph.CHART_DEFAULTS.TENSION,
        pointRadius: Graph.CHART_DEFAULTS.POINT_RADIUS,
        stack: 'languages',
      };
    });
  }

  private createChartConfiguration(
    labels: string[],
    datasets: ChartDataset<'line'>[],
    graphTitle: string,
    yAxisTitle: string,
  ): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        scales: {
          x: {
            title: { display: false, text: 'Period' },
          },
          y: {
            title: { display: true, text: yAxisTitle },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: graphTitle },
        },
      },
    };
  }
}
