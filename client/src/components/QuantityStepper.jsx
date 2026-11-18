export default function QuantityStepper({ value, max, onChange, label = 'Quantity' }) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-stone-line" role="group" aria-label={label}>
      <button type="button" className="h-full w-10 rounded-l-full text-lg hover:bg-indigo-soft disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        −
      </button>
      <output className="w-8 text-center text-sm font-medium" aria-live="polite">
        {value}
      </output>
      <button type="button" className="h-full w-10 rounded-r-full text-lg hover:bg-indigo-soft disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
