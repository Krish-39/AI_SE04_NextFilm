import { ArrowBigUp, ExternalLink, MessageSquare } from "lucide-react";

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
        <h2 className="section-title" id="buzz-title">
          <RedditIcon size={22} /> Community buzz
        </h2>
        {data && data.discussions > 0 && (
          <div className="buzz__score" aria-label={`Reddit buzz ${data.score} out of 100`}>
            <span className="buzz__number">{data.score}</span>
            <span className="buzz__of">/100</span>
            <span className="buzz__label">
              {label(data.score)} · {data.discussions} thread{data.discussions === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {loading && (
        <div className="buzz__list" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64 }} />
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <ul className="buzz__list">
          {posts.map((p) => (
            <li key={p.id}>
              <a href={p.permalink} target="_blank" rel="noreferrer">
                <span className="buzz__post">{p.title}</span>
                <span className="buzz__meta">
                  <span>r/{p.subreddit}</span>
                  <span>
                    <ArrowBigUp size={14} aria-hidden="true" /> {p.score.toLocaleString()}
                    <span className="visually-hidden"> upvotes</span>
                  </span>
                  <span>
                    <MessageSquare size={13} aria-hidden="true" /> {p.comments.toLocaleString()}
                    <span className="visually-hidden"> comments</span>
                  </span>
                </span>
                <ExternalLink size={14} aria-hidden="true" className="buzz__out" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {!loading && posts.length === 0 && (
        <p className="buzz__empty">No Reddit discussions found yet.</p>
      )}

      <a className="buzz__more" href={redditSearchUrl(title)} target="_blank" rel="noreferrer">
        See all discussions on Reddit <ExternalLink size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
