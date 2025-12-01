import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Contribution } from '../domain/contribution/contribution';
import { fetchGitHubContributions } from '../infrastructure/api/fetchGitHubContributions';

export interface GraphUseCase {
  createGraph(user: string): Promise<Buffer>;
}

export class GraphUseCaseImpl implements GraphUseCase {
  constructor() {}

  async createGraph(user: string): Promise<Buffer> {
    const to = new Date();
    const from = new Date();
    from.setFullYear(to.getFullYear() - 1);

    const contributions = await fetchGitHubContributions(
      user,
      from.toISOString(),
      to.toISOString(),
    );

    const image = await generateGraphImage(contributions);

    return image;
  }
}

const width = 800;
const height = 400;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  chartCallback: (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  },
});

export const generateGraphImage = async (contributions: Contribution[]): Promise<Buffer> => {
  const cumulativeContributions = contributions.reduce(
    (acc, a) => {
      const total = (acc.length > 0 ? acc[acc.length - 1].total : 0) + a.count;
      acc.push({
        date: new Date(a.date),
        total,
      });
      return acc;
    },
    [] as { date: Date; total: number }[],
  );

  const labels = cumulativeContributions.map((c) =>
    c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  );
  const data = cumulativeContributions.map((c) => c.total);

  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cumulative Contributions',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
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

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  return image;
};
