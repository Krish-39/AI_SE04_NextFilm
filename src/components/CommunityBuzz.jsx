import { ExternalLink } from "lucide-react";

import { redditSearchUrl, titleDiscussions } from "../lib/reddit";
import { useAsync } from "../lib/useAsync";
import RedditIcon from "./RedditIcon";
import "./CommunityBuzz.css";

const label = (score) => (score >= 75 ? "Huge buzz" : score >= 50 ? "Lots of talk" : score >= 25 ? "Some buzz" : "Quiet");

export default function CommunityBuzz({ title, kind }) {
  const { data, loading } = useAsync(() => titleDiscussions(title, kind), [title, kind]);
  const posts = data?.posts?.slice(0, 3) || [];

  return (
    <section className="buzz" aria-labelledby="buzz-title" aria-busy={loading}>
      <div className="buzz__head">
        <div>
          <h2 className="section-title tape" id="buzz-title">
            What the regulars say
          </h2>
          <p className="buzz__lede">
            <RedditIcon size={13} /> Talk about {title} on Reddit
            {data && data.discussions > 0 && (
              <>
                {" "}
                · {label(data.score).toLowerCase()} across {data.discussions} thread{data.discussions === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>
        {data && data.discussions > 0 && (
          <span className="sticker sticker--yellow buzz__score" style={{ "--rot": "6deg" }}>
            <span>
              <span className="buzz__number">{data.score}</span>
              <small>buzz</small>
            </span>
            <span className="visually-hidden"> out of 100</span>
          </span>
        )}
      </div>

      {loading && (
        <div className="buzz__list" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 150 }} />
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <ul className="buzz__list">
          {posts.map((p, i) => (
            <li key={p.id} style={{ "--rot": `${[-1.2, 0.8, -0.4][i]}deg` }}>
              <a href={p.permalink} target="_blank" rel="noreferrer" className="index-card buzz__card">
                <span className="hand buzz__post">“{p.title}”</span>
                <span className="buzz__meta">
                  r/{p.subreddit} · {p.score.toLocaleString()} upvotes · {p.comments.toLocaleString()} comments
                </span>
                <ExternalLink size={14} aria-hidden="true" className="buzz__out" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {!loading && posts.length === 0 && (
        <p className="buzz__empty">No Reddit discussions found yet. Be the first regular to post one.</p>
      )}

      <a className="buzz__more" href={redditSearchUrl(title)} target="_blank" rel="noreferrer">
        See all discussions on Reddit <ExternalLink size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
