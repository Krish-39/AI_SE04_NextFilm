import {
  FIRST_YEAR,
  LANGUAGES,
  MOVIE_GENRES,
  RATINGS,
  RUNTIMES,
  TV_GENRES,
} from "../lib/filters";
import { REGIONS, setRegion } from "../lib/region";
import { image } from "../lib/tmdb";
import "./FilterPanel.css";

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 2 - FIRST_YEAR + 1 }, (_, i) => thisYear + 2 - i);

function Group({ title, children, id }) {
  return (
    <fieldset className="filter-group">
      <legend id={id}>{title}</legend>
      {children}
    </fieldset>
  );
}

function Choice({ pressed, onClick, children, ...rest }) {
  return (
    <button type="button" className="choice" aria-pressed={pressed} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

export default function FilterPanel({ filters: f, onChange, providers, providersError, region }) {
  const set = (patch) => onChange({ ...f, ...patch });
  const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const genres = f.type === "tv" ? TV_GENRES : MOVIE_GENRES;

  return (
    <div className="filter-panel">
      <Group title="Genres">
        <div className="choice-list">
          {genres.map(([id, name]) => (
            <Choice key={id} pressed={f.genres.includes(id)} onClick={() => set({ genres: toggle(f.genres, id) })}>
              {name}
            </Choice>
          ))}
        </div>
        {f.genres.length > 1 && <p className="filter-hint">Showing titles that match all selected genres.</p>}
      </Group>

      <Group title="Release year">
        <div className="year-range">
          <label>
            <span>From</span>
            <select
              className="select"
              value={f.from || ""}
              onChange={(e) => set({ from: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Any</option>
              {YEARS.filter((y) => !f.to || y <= f.to).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>To</span>
            <select
              className="select"
              value={f.to || ""}
              onChange={(e) => set({ to: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Any</option>
              {YEARS.filter((y) => !f.from || y >= f.from).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="choice-list choice-list--tight">
          {[
            ["2020s", 2020, null],
            ["2010s", 2010, 2019],
            ["2000s", 2000, 2009],
            ["90s", 1990, 1999],
            ["80s", 1980, 1989],
            ["Classics", null, 1979],
          ].map(([label, from, to]) => (
            <Choice key={label} pressed={f.from === from && f.to === to} onClick={() => set({ from, to })}>
              {label}
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="choice-list choice-list--tight" role="radiogroup" aria-label="Minimum rating">
          {RATINGS.map(([value, label]) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={f.rating === value}
              className="choice"
              onClick={() => set({ rating: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </Group>

      {f.type === "movie" && (
        <Group title="Length">
          <div className="choice-list choice-list--tight" role="radiogroup" aria-label="Running time">
            {RUNTIMES.map(([value, label]) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={f.runtime === value}
                className="choice"
                onClick={() => set({ runtime: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </Group>
      )}

      <Group title="Original language">
        <select className="select" value={f.lang} onChange={(e) => set({ lang: e.target.value })} aria-label="Original language">
          {LANGUAGES.map(([value, label]) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Group>

      <Group title="Streaming on">
        <label className="region-picker">
          <span>Country</span>
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {providersError && <p className="filter-hint">Couldn’t load streaming services for this country.</p>}
        {!providersError && !providers && <div className="skeleton" style={{ height: 88, marginTop: 10 }} />}
        {providers && (
          <div className="provider-list">
            {providers.map((p) => (
              <button
                key={p.provider_id}
                type="button"
                className="provider"
                aria-pressed={f.providers.includes(p.provider_id)}
                onClick={() => set({ providers: toggle(f.providers, p.provider_id) })}
                title={p.provider_name}
              >
                <img src={image(p.logo_path, "w92")} alt="" width="40" height="40" loading="lazy" />
                <span>{p.provider_name}</span>
              </button>
            ))}
          </div>
        )}
      </Group>
    </div>
  );
}
