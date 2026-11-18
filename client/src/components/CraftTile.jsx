/**
 * A generated block-print style tile shown when a product has no photo.
 * The motif depends on the craft category and the colourway on the product slug,
 * so every product gets a stable, distinct image and the demo never shows a broken image.
 */
const COLOURWAYS = [
  { bg: '#26336B', ink: '#D49A1A' },
  { bg: '#E6E8F2', ink: '#26336B' },
  { bg: '#A63A2B', ink: '#F4E6D0' },
  { bg: '#2F6B4F', ink: '#E9DFC4' },
  { bg: '#1A2350', ink: '#E6E8F2' },
];

const MOTIFS = {
  // Ajrakh-like star lattice
  textiles: (ink) => (
    <>
      <path d="M20 4l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill={ink} />
      <circle cx="20" cy="20" r="3" fill="none" stroke={ink} strokeWidth="1.5" opacity="0.6" />
    </>
  ),
  // Lota (water pot) silhouette
  brassware: (ink) => <path d="M15 8h10l-2 4c6 2 9 6 9 11 0 6-5 9-12 9s-12-3-12-9c0-5 3-9 9-11z" fill={ink} />,
  // Concentric bowl rings
  ceramics: (ink) => (
    <g fill="none" stroke={ink} strokeWidth="2">
      <circle cx="20" cy="20" r="13" />
      <circle cx="20" cy="20" r="8" />
      <circle cx="20" cy="20" r="3" fill={ink} />
    </g>
  ),
  // Leaf, like a chinar carving
  woodcraft: (ink) => <path d="M20 4c9 6 12 14 0 32C8 18 11 10 20 4zm0 4v26" fill={ink} stroke={ink} />,
  // Lantern
  lighting: (ink) => (
    <>
      <path d="M17 5h6v4h-6z" fill={ink} />
      <path d="M12 12h16l-3 20H15z" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="20" cy="22" r="3" fill={ink} />
    </>
  ),
};

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function CraftTile({ product, className = '' }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} loading="lazy" className={`aspect-square w-full object-cover ${className}`} />;
  }
  const { bg, ink } = COLOURWAYS[hash(product.slug ?? product.name) % COLOURWAYS.length];
  const motif = MOTIFS[product.category] ?? MOTIFS.textiles;
  const id = `tile-${product.slug ?? 'p'}`;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={product.name} className={`aspect-square w-full ${className}`}>
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          {motif(ink)}
        </pattern>
      </defs>
      <rect width="200" height="200" fill={bg} />
      <rect width="200" height="200" fill={`url(#${id})`} opacity="0.9" />
    </svg>
  );
}
