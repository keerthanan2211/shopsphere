import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import CraftTile from '../components/CraftTile';
import { ErrorState, FormError, Loading } from '../components/PageState';
import QuantityStepper from '../components/QuantityStepper';
import { Rating, RatingInput, Stars } from '../components/Rating';
import { useAddReviewMutation, useGetProductQuery, useMeQuery } from '../features/api/apiSlice';
import { addItem, MAX_QTY, selectCartItems } from '../features/cart/cartSlice';
import { categoryLabel, formatDate, formatINR } from '../utils/format';

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(slug);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const dispatch = useDispatch();
  const inCart = useSelector(selectCartItems).find((i) => i.productId === product?._id)?.quantity ?? 0;

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} title="Product not found" />;

  const available = Math.min(MAX_QTY, product.stock) - inCart;

  const add = () => {
    dispatch(addItem({ product, quantity }));
    setAdded(true);
    setQuantity(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-stone">
        <Link to="/" className="hover:underline">Shop</Link> /{' '}
        <Link to={`/?category=${product.category}`} className="hover:underline">{categoryLabel(product.category)}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <CraftTile product={product} className="rounded-xl" />

        <div>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          {product.origin && <p className="mt-2 text-stone">Made in {product.origin}</p>}
          <div className="mt-3">
            <Rating value={product.rating} count={product.numReviews} />
          </div>
          <p className="mt-6 text-2xl font-medium">{formatINR(product.price)}</p>
          <p className="text-xs text-stone">Inclusive of all taxes at checkout</p>
          <p className="mt-6 max-w-prose leading-relaxed">{product.description}</p>

          <div className="mt-8 border-t border-stone-line pt-6">
            {product.stock === 0 ? (
              <p className="font-medium text-madder">Out of stock. Check back soon.</p>
            ) : available <= 0 ? (
              <p className="text-sm">
                You have the maximum available in your cart. <Link to="/cart" className="btn-link">View cart</Link>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <QuantityStepper value={quantity} max={available} onChange={setQuantity} />
                <button type="button" className="btn-primary" onClick={add}>
                  Add to cart
                </button>
                {product.stock <= 5 && <span className="text-sm font-medium text-madder">Only {product.stock} left</span>}
              </div>
            )}
            {added && (
              <p role="status" className="mt-4 text-sm">
                Added to your cart. <Link to="/cart" className="btn-link">Go to cart</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <Reviews product={product} />
    </div>
  );
}

function Reviews({ product }) {
  const { data: user } = useMeQuery();
  const [addReview, { isLoading, error, isSuccess }] = useAddReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const alreadyReviewed = user && product.reviews.some((r) => r.user === user.id);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    await addReview({ id: product._id, rating, comment }).unwrap().catch(() => {});
  };

  return (
    <section aria-labelledby="reviews" className="mt-16 grid gap-10 border-t border-stone-line pt-10 md:grid-cols-2">
      <div>
        <h2 id="reviews" className="font-display text-2xl">
          Reviews
        </h2>
        {product.reviews.length === 0 && <p className="mt-3 text-sm text-stone">No reviews yet.</p>}
        <ul className="mt-4 space-y-6">
          {product.reviews.map((r) => (
            <li key={r._id}>
              <Stars value={r.rating} />
              <span className="sr-only">{r.rating} out of 5 stars</span>
              <p className="mt-1 text-sm">{r.comment}</p>
              <p className="mt-1 text-xs text-stone">
                {r.name}, {formatDate(r.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {!user ? (
          <p className="text-sm">
            <Link to="/login" state={{ from: `/products/${product.slug}` }} className="btn-link">Sign in</Link> to write a review.
          </p>
        ) : alreadyReviewed || isSuccess ? (
          <p className="text-sm text-stone">Thanks, your review is posted.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="font-medium">Write a review</h3>
            <RatingInput value={rating} onChange={setRating} />
            <div>
              <label htmlFor="comment" className="label">Your review</label>
              <textarea id="comment" className="input h-auto py-2" rows={4} required minLength={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <FormError error={error} />
            <button type="submit" className="btn-primary" disabled={isLoading || !rating}>
              {isLoading ? 'Posting…' : 'Post review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
