import type { FormState } from '../App.tsx';
import {
  CONTRIBUTION_TYPES,
  type ContributionType,
  type GraphType,
  SIZES,
  THEMES,
} from '../lib/snippet.ts';

interface ControlsProps {
  state: FormState;
  userError: string;
  onChange: (patch: Partial<FormState>) => void;
}

const SIZE_LABELS: Record<string, string> = {
  small: 'small (600×300)',
  medium: 'medium (800×400)',
  large: 'large (1000×500)',
};

export function Controls({ state, userError, onChange }: ControlsProps) {
  const isContrib = state.graph === 'contributions';

  const toggleType = (type: ContributionType, checked: boolean) => {
    const next = checked ? [...state.types, type] : state.types.filter((t) => t !== type);
    onChange({ types: CONTRIBUTION_TYPES.filter((t) => next.includes(t)) });
  };

  return (
    <section className="panel" aria-label="Controls">
      <div className="field">
        <label htmlFor="user">
          GitHub username <span className="hint">(required)</span>
        </label>
        <input
          type="text"
          id="user"
          placeholder="octocat"
          autoComplete="off"
          spellCheck={false}
          className={userError && state.user.length > 0 ? 'invalid' : undefined}
          value={state.user}
          onChange={(e) => onChange({ user: e.target.value })}
        />
        <div className="error-text">{state.user.length > 0 ? userError : ''}</div>
      </div>

      <div className="field">
        <span className="field-label">Graph type</span>
        <div className="seg">
          {(['contributions', 'languages'] as GraphType[]).map((g) => (
            <label key={g}>
              <input
                type="radio"
                name="graph"
                value={g}
                checked={state.graph === g}
                onChange={() => onChange({ graph: g })}
              />
              <span>{g === 'contributions' ? 'Contributions' : 'Languages'}</span>
            </label>
          ))}
        </div>
      </div>

      {isContrib && (
        <div className="field">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={state.theme}
            onChange={(e) => onChange({ theme: e.target.value })}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label htmlFor="size">Size</label>
        <select id="size" value={state.size} onChange={(e) => onChange({ size: e.target.value })}>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {SIZE_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="from">
          From <span className="hint">(optional)</span>
        </label>
        <input
          type="date"
          id="from"
          value={state.from}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="to">
          To <span className="hint">(optional)</span>
        </label>
        <input
          type="date"
          id="to"
          value={state.to}
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </div>

      {isContrib && (
        <div className="field">
          <span className="field-label">
            Contribution types <span className="hint">(all by default)</span>
          </span>
          <div className="types">
            {CONTRIBUTION_TYPES.map((type) => (
              <label key={type}>
                <input
                  type="checkbox"
                  value={type}
                  checked={state.types.includes(type)}
                  onChange={(e) => toggleType(type, e.target.checked)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
