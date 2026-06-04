export type GraphType = 'contributions' | 'languages';

export type ContributionType = 'commit' | 'issue' | 'pr' | 'review';

export const CONTRIBUTION_TYPES: readonly ContributionType[] = ['commit', 'issue', 'pr', 'review'];

export const THEMES = [
  'default',
  'blue',
  'red',
  'green',
  'purple',
  'orange',
  'pink',
  'dark',
  'light',
] as const;

export const SIZES = ['small', 'medium', 'large'] as const;

export const REPO_URL = 'https://github.com/qkitzero/github-contribution-growth-graph';

const DEFAULT_THEME = 'default';
const DEFAULT_SIZE = 'medium';

export interface GraphParams {
  graph: GraphType;
  user: string;
  theme?: string;
  size?: string;
  from?: string;
  to?: string;
  types?: ContributionType[];
}

export function buildGraphUrl(baseUrl: string, params: GraphParams): string {
  const graph: GraphType = params.graph === 'languages' ? 'languages' : 'contributions';
  const origin = baseUrl.replace(/\/+$/, '');
  const query: string[] = [];

  const add = (key: string, value: string): void => {
    query.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  };

  add('user', params.user.trim());

  if (params.from) add('from', params.from);
  if (params.to) add('to', params.to);
  if (params.size && params.size !== DEFAULT_SIZE) add('size', params.size);

  if (graph === 'contributions') {
    if (params.theme && params.theme !== DEFAULT_THEME) add('theme', params.theme);

    const types = params.types ?? [];
    if (types.length > 0 && types.length < CONTRIBUTION_TYPES.length) {
      add('types', types.join(','));
    }
  }

  return `${origin}/graph/${graph}?${query.join('&')}`;
}

export function buildMarkdown(imageUrl: string, altText: string): string {
  return `[![${altText}](${imageUrl})](${REPO_URL})`;
}

export function buildHtml(imageUrl: string, altText: string): string {
  return `<a href="${REPO_URL}"><img src="${imageUrl}" alt="${altText}" /></a>`;
}

export function altTextFor(graph: GraphType): string {
  return graph === 'languages'
    ? 'GitHub Language Growth Graph'
    : 'GitHub Contribution Growth Graph';
}

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function validateUser(user: string): string {
  if (!user) return 'Username is required.';
  if (!USERNAME_RE.test(user)) return 'That does not look like a valid GitHub username.';
  return '';
}
