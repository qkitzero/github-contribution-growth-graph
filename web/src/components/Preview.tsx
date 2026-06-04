import { useState } from 'react';

interface PreviewProps {
  url: string;
  placeholder: string;
}

export function Preview({ url, placeholder }: PreviewProps) {
  const [loadedUrl, setLoadedUrl] = useState('');
  const loaded = url !== '' && loadedUrl === url;

  return (
    <div className="preview-box">
      {url ? (
        <>
          <img
            src={url}
            alt="Graph preview"
            className={loaded ? '' : 'is-loading'}
            onLoad={() => setLoadedUrl(url)}
            onError={() => setLoadedUrl(url)}
          />
          {!loaded && (
            <span className="preview-status preview-spinner">
              <span className="spinner" aria-hidden="true" />
              Loading preview…
            </span>
          )}
        </>
      ) : (
        <span className="preview-status">{placeholder}</span>
      )}
    </div>
  );
}
