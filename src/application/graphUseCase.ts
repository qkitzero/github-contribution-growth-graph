import { Contribution, ContributionAggregator } from '../domain/contribution/contribution';
import { GitHubContributionFetcher } from '../infrastructure/github/githubContributionFetcher';
import { GraphImageGenerator } from '../domain/graph/graphImageGenerator';

export interface GraphUseCase {
  createGraph(user: string, from?: string, to?: string): Promise<Buffer>;
}

export class GraphUseCaseImpl implements GraphUseCase {
  private contributionFetcher: GitHubContributionFetcher;
  private contributionAggregator = new ContributionAggregator();
  private graphImageGenerator: GraphImageGenerator;

  constructor(
    contributionFetcher: GitHubContributionFetcher = new GitHubContributionFetcher(),
    graphImageGenerator: GraphImageGenerator = new GraphImageGenerator(),
  ) {
    this.contributionFetcher = contributionFetcher;
    this.graphImageGenerator = graphImageGenerator;
  }

  async createGraph(user: string, from?: string, to?: string): Promise<Buffer> {
    // 日付範囲の計算
    const now = new Date();
    const toDate = to ? new Date(to) : now;
    const fromDate = from
      ? new Date(from)
      : new Date(new Date(toDate).setFullYear(toDate.getFullYear() - 1));

    // コントリビューションを年単位でバッチ取得
    const contributions = await this.fetchContributions(user, fromDate, toDate);

    // 日付順にソート
    const sortedContributions = this.contributionAggregator.sortByDate(contributions);

    // 累積値を計算
    const cumulativeContributions =
      this.contributionAggregator.calculateCumulative(sortedContributions);

    // グラフ描画用データに変換
    const graphData = this.contributionAggregator.toGraphData(cumulativeContributions);

    // 画像を生成して返却
    return await this.graphImageGenerator.generate(graphData);
  }

  private async fetchContributions(
    user: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<Contribution[]> {
    const promises: Promise<Contribution[]>[] = [];
    let currentDate = fromDate;

    while (currentDate < toDate) {
      const nextDate = new Date(currentDate);
      nextDate.setFullYear(currentDate.getFullYear() + 1);

      promises.push(
        this.contributionFetcher.fetch(
          user,
          currentDate.toISOString(),
          (nextDate < toDate ? nextDate : toDate).toISOString(),
        ),
      );
      currentDate = nextDate;
    }

    const results = await Promise.all(promises);
    return results.flat();
  }
}
