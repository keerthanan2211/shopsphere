export function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 20 20">
          <path
            d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8z"
            fill={value >= n - 0.25 ? '#D49A1A' : value >= n - 0.75 ? 'url(#half)' : '#E4E1DA'}
          />
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#D49A1A" />
              <stop offset="50%" stopColor="#E4E1DA" />
            </linearGradient>
          </defs>
        </svg>
      ))}
    </span>
  );
}

export function Rating({ value, count }) {
  if (!count) return <span className="text-xs text-stone">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone">
      <Stars value={value} />
      <span>
        <span className="sr-only">Rated </span>
        {value.toFixed(1)}
        <span className="sr-only"> out of 5,</span> ({count})
      </span>
    </span>
  );
}

/** Accessible star picker built on radio buttons. */
export function RatingInput({ value, onChange }) {
  return (
    <fieldset>
      <legend className="label">Your rating</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <span className="block rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-indigo">
              <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden>
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8z" fill={n <= value ? '#D49A1A' : '#E4E1DA'} />
              </svg>
            </span>
            <span className="sr-only">{n} {n === 1 ? 'star' : 'stars'}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
