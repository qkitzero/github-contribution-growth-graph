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

    // Group contributions by type and period (year/month)
    type PeriodKey = string; // Format: "YYYY/MM"
    type PeriodData = Map<PeriodKey, number>; // period -> total count for that period

    const byTypeAndPeriod = new Map<string, PeriodData>();

    for (const c of contributions) {
      const year = c.from.getFullYear();
      const month = String(c.from.getMonth() + 1).padStart(2, '0');
      const periodKey: PeriodKey = `${year}/${month}`;

      if (!byTypeAndPeriod.has(c.type)) {
        byTypeAndPeriod.set(c.type, new Map());
      }

      const periodData = byTypeAndPeriod.get(c.type)!;
      const currentTotal = periodData.get(periodKey) || 0;
      periodData.set(periodKey, currentTotal + c.totalCount);
    }

    // Get all unique periods sorted chronologically
    const allPeriods = new Set<PeriodKey>();
    for (const periodData of byTypeAndPeriod.values()) {
      for (const period of periodData.keys()) {
        allPeriods.add(period);
      }
    }

    const labels = Array.from(allPeriods).sort();

    const typeOrder = ['commit', 'issue', 'pull_request', 'pull_request_review'];
    const datasets = typeOrder
      .filter((type) => byTypeAndPeriod.has(type))
      .map((type) => {
        const periodData = byTypeAndPeriod.get(type)!;
        const color = this.theme.getColorForType(type);

        // Calculate cumulative totals for each period
        let cumulative = 0;
        const data = labels.map((period) => {
          cumulative += periodData.get(period) || 0;
          return cumulative;
        });

        return {
          label: type,
          data,
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
            title: { display: false, text: 'Period' },
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
