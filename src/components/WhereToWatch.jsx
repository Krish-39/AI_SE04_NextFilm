import { ExternalLink } from "lucide-react";

import { REGIONS, setRegion, useRegion } from "../lib/region";
import { image, tmdb } from "../lib/tmdb";
import { useAsync } from "../lib/useAsync";
import "./WhereToWatch.css";

const GROUPS = [
  ["stream", "Stream"],
  ["free", "Free"],
  ["rent", "Rent"],
  ["buy", "Buy"],
];

export default function WhereToWatch({ kind, id, title }) {
  const region = useRegion();
  const { data, loading, error } = useAsync(() => tmdb.watchProviders(kind, id, region), [kind, id, region]);
  const country = REGIONS.find(([c]) => c === region)?.[1] || region;
  const groups = data ? GROUPS.filter(([key]) => data[key]?.length) : [];

  return (
    <section className="where" aria-labelledby="where-title">
      <div className="where__head">
        <h2 className="section-title tape tape--tilt-r" id="where-title">
          Where to watch
        </h2>
        <label className="where__region">
          <span className="visually-hidden">Country</span>
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <div className="skeleton" style={{ height: 72, marginTop: 16 }} />}

      {!loading && (error || groups.length === 0) && (
        <p className="where__empty">
          {error ? "Couldn’t load streaming options." : `${title} isn’t available to stream, rent or buy in ${country} right now.`}
        </p>
      )}

      {!loading && groups.length > 0 && (
        <div className="where__groups">
          {groups.map(([key, label]) => (
            <div key={key} className="where__group">
              <h3>{label}</h3>
              <ul>
                {data[key].map((p) => (
                  <li key={p.provider_id} title={p.provider_name}>
                    <img src={image(p.logo_path, "w92")} alt="" width="44" height="44" loading="lazy" />
                    <span>{p.provider_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="where__foot">
        {data?.link && (
          <a className="where__link" href={data.link} target="_blank" rel="noreferrer">
            All options and prices <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
        <span className="where__credit">Availability data by JustWatch</span>
      </p>
    </section>
  );
}
