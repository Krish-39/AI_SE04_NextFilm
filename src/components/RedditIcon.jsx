// Reddit's "Snoo" mark, simplified, for attributing community content.
export default function RedditIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
      <path d="M16.7 8.4a1.9 1.9 0 0 0-3.2-1.3 9.4 9.4 0 0 0-5-1.6l.9-4 2.8.6a1.3 1.3 0 1 0 .1-.7L9.3.8a.4.4 0 0 0-.4.3l-1 4.4a9.5 9.5 0 0 0-5 1.6 1.9 1.9 0 1 0-2.1 3.1 3.7 3.7 0 0 0 0 .6c0 3 3.5 5.5 7.9 5.5s7.9-2.5 7.9-5.5v-.6a1.9 1.9 0 0 0 1.1-1.8ZM5 10a1.3 1.3 0 1 1 1.3 1.3A1.3 1.3 0 0 1 5 10Zm7.6 3.6a5 5 0 0 1-3.2 1 5 5 0 0 1-3.2-1 .3.3 0 1 1 .5-.5 4.4 4.4 0 0 0 2.7.8 4.4 4.4 0 0 0 2.7-.8.3.3 0 0 1 .5.5Zm-.2-2.3a1.3 1.3 0 1 1 1.3-1.3 1.3 1.3 0 0 1-1.3 1.3Z" />
    </svg>
  );
}
