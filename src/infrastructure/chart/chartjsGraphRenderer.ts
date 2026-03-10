import { ChartConfiguration, ChartDataset } from 'chart.js';
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

export class ChartjsGraphRenderer implements GraphRenderer {
  private static readonly CHART_DEFAULTS = {
    TENSION: 0.1,
    POINT_RADIUS: 0,
    BACKGROUND_ALPHA: '80',
  } as const;

  private createCanvas(size: Size, theme: Theme): ChartJSNodeCanvas {
    return new ChartJSNodeCanvas({
      width: size.width,
      height: size.height,
      backgroundColour: theme.backgroundColor,
      chartCallback: (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
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
      'GitHub Contribution Growth Graph',
      'Cumulative Contributions',
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
      'GitHub Language Growth Graph',
      'Cumulative Language Activity (weighted commits)',
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

      return {
        label: type,
        data: cumulativeData,
        borderColor: color,
        backgroundColor: `${color}${ChartjsGraphRenderer.CHART_DEFAULTS.BACKGROUND_ALPHA}`,
        fill: true,
        tension: ChartjsGraphRenderer.CHART_DEFAULTS.TENSION,
        pointRadius: ChartjsGraphRenderer.CHART_DEFAULTS.POINT_RADIUS,
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
        backgroundColor: `${color}${ChartjsGraphRenderer.CHART_DEFAULTS.BACKGROUND_ALPHA}`,
        fill: true,
        tension: ChartjsGraphRenderer.CHART_DEFAULTS.TENSION,
        pointRadius: ChartjsGraphRenderer.CHART_DEFAULTS.POINT_RADIUS,
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
            title: { display: false, text: yAxisTitle },
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
