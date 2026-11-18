import { Link } from 'react-router-dom';
import { categoryLabel, formatINR } from '../utils/format';
import CraftTile from './CraftTile';
import { Rating } from './Rating';

export default function ProductCard({ product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  return (
    <article className="group">
      <Link to={`/products/${product.slug}`} className="block overflow-hidden rounded-lg">
        <CraftTile product={product} className="transition-transform duration-300 group-hover:scale-[1.03]" />
      </Link>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-stone">
          {categoryLabel(product.category)}
          {product.origin ? `, ${product.origin.split(',')[0]}` : ''}
        </p>
        <h3 className="font-display text-lg leading-snug">
          <Link to={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.numReviews} />
        <p className="flex items-baseline gap-3">
          <span className="font-medium">{formatINR(product.price)}</span>
          {product.stock === 0 && <span className="text-xs font-medium text-madder">Out of stock</span>}
          {lowStock && <span className="text-xs font-medium text-madder">Only {product.stock} left</span>}
        </p>
      </div>
    </article>
  );
}
