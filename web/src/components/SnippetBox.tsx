import { useRef, useState } from 'react';

interface SnippetBoxProps {
  label: string;
  value: string;
  disabled: boolean;
}

export function SnippetBox({ label, value, disabled }: SnippetBoxProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.select();
      if (!document.execCommand('copy')) return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="snippet">
      <div className="snippet-head">
        <span className="snippet-label">{label}</span>
        <button type="button" className="copy-btn" disabled={disabled} onClick={handleCopy}>
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>
      <textarea ref={textareaRef} readOnly rows={2} value={value} />
    </div>
  );
}
