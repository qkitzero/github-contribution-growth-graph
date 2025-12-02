/** GitHubの日次コントリビューション */
export type Contribution = {
  date: string;
  count: number;
};

/** 累積コントリビューション */
export type CumulativeContribution = {
  date: Date;
  total: number;
};

/** グラフ描画用データ */
export type GraphData = {
  labels: string[];
  values: number[];
};

/**
 * コントリビューションデータを集計・変換するドメインサービス
 *
 * 将来的な拡張例：
 * - 週次/月次での集計
 * - 移動平均の計算
 * - 統計情報の算出（平均、最大値など）
 */
export class ContributionAggregator {
  /**
   * コントリビューションを日付順にソート（昇順）
   */
  sortByDate(contributions: Contribution[]): Contribution[] {
    return [...contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  /**
   * コントリビューションの累積値を計算
   */
  calculateCumulative(contributions: Contribution[]): CumulativeContribution[] {
    return contributions.reduce(
      (acc, contribution) => {
        const total = (acc.length > 0 ? acc[acc.length - 1].total : 0) + contribution.count;
        acc.push({
          date: new Date(contribution.date),
          total,
        });
        return acc;
      },
      [] as CumulativeContribution[],
    );
  }

  /**
   * 累積コントリビューションをグラフ描画用データに変換
   */
  toGraphData(cumulativeContributions: CumulativeContribution[]): GraphData {
    const labels = cumulativeContributions.map((c) =>
      c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );
    const values = cumulativeContributions.map((c) => c.total);

    return { labels, values };
  }
}
