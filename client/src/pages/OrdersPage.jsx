import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useMyOrdersQuery } from '../features/api/apiSlice';
import { formatDate, formatINR } from '../utils/format';

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useMyOrdersQuery();
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl">Your orders</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-stone">
          No orders yet. <Link to="/" className="btn-link">Start shopping</Link>
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-line border-y border-stone-line">
          {orders.map((o) => (
            <li key={o._id}>
              <Link to={`/orders/${o._id}`} className="flex flex-wrap items-center gap-4 py-4 hover:bg-indigo-soft/40">
                <span className="font-medium">#{o._id.slice(-6).toUpperCase()}</span>
                <span className="text-sm text-stone">{formatDate(o.createdAt)}</span>
                <span className="text-sm text-stone">{o.items.reduce((n, i) => n + i.quantity, 0)} items</span>
                <span className="ml-auto font-medium">{formatINR(o.total)}</span>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
