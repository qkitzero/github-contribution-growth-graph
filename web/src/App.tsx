import { useEffect, useMemo, useState } from 'react';
import { Controls } from './components/Controls.tsx';
import { Preview } from './components/Preview.tsx';
import { SnippetBox } from './components/SnippetBox.tsx';
import {
  altTextFor,
  buildGraphUrl,
  buildHtml,
  buildMarkdown,
  CONTRIBUTION_TYPES,
  type ContributionType,
  type GraphType,
  REPO_URL,
  validateUser,
} from './lib/snippet.ts';

export interface FormState {
  graph: GraphType;
  user: string;
  theme: string;
  size: string;
  from: string;
  to: string;
  types: ContributionType[];
}

const INITIAL_STATE: FormState = {
  graph: 'contributions',
  user: '',
  theme: 'default',
  size: 'medium',
  from: '',
  to: '',
  types: [...CONTRIBUTION_TYPES],
};

const PREVIEW_DEBOUNCE_MS = 500;

export function App() {
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [previewUrl, setPreviewUrl] = useState('');

  const origin = window.location.origin;
  const userError = validateUser(state.user.trim());
  const isValid = userError === '';

  const url = useMemo(
    () => (isValid ? buildGraphUrl(origin, state) : ''),
    [isValid, origin, state],
  );

  const altText = altTextFor(state.graph);
  const markdown = url ? buildMarkdown(url, altText) : '';
  const html = url ? buildHtml(url, altText) : '';

  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewUrl(url), url ? PREVIEW_DEBOUNCE_MS : 0);
    return () => window.clearTimeout(timer);
  }, [url]);

  const handleChange = (patch: Partial<FormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const placeholder = state.user
    ? userError || 'Loading preview…'
    : 'Enter a username to see your graph.';

  return (
    <>
      <header>
        <div>
          <h1>GitHub Contribution Growth Graph</h1>
          <div className="subtitle">
            Build your graph, copy the Markdown, paste it into your profile.
          </div>
        </div>
        <a className="star-btn" href={REPO_URL} target="_blank" rel="noopener noreferrer">
          ⭐ Star on GitHub
        </a>
      </header>

      <main>
        <Controls state={state} userError={userError} onChange={handleChange} />

        <section aria-label="Preview and snippets">
          <Preview url={previewUrl} placeholder={placeholder} />
          <SnippetBox label="Markdown" value={markdown} disabled={!isValid} />
          <SnippetBox label="URL" value={url} disabled={!isValid} />
          <SnippetBox label="HTML" value={html} disabled={!isValid} />
        </section>
      </main>

      <footer>
        Only public repository contributions are included · <a href={REPO_URL}>Docs &amp; source</a>
      </footer>
    </>
  );
}
