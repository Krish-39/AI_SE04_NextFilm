// Small segmented control used for client-side type filters.
export default function Tabs({ label, value, options, onChange }) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map(([v, text, count]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}>
          {text}
          {count !== undefined && <span className="segmented__count">{count}</span>}
        </button>
      ))}
    </div>
  );
}
