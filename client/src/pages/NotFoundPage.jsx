import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="mt-2 text-stone">The link may be old, or the product may have been removed.</p>
      <Link to="/" className="btn-primary mt-6">Back to the shop</Link>
    </div>
  );
}
