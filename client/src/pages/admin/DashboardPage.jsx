import { Link } from 'react-router-dom';
import { ErrorState, Loading } from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { useAdminStatsQuery } from '../../features/api/apiSlice';
import { formatDate, formatINR, ORDER_STATUS } from '../../utils/format';

export default function DashboardPage() {
  const { data, isLoading, error } = useAdminStatsQuery();
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  const toFulfil = data.ordersByStatus.paid ?? 0;

  return (
    <div className="space-y-10">
      <dl className="grid gap-px overflow-hidden rounded-xl border border-stone-line bg-stone-line sm:grid-cols-3">
        <div className="bg-white p-5">
          <dt className="text-sm text-stone">Revenue (paid orders)</dt>
          <dd className="mt-1 font-display text-3xl">{formatINR(data.revenue)}</dd>
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-stone">Waiting to ship</dt>
          <dd className="mt-1 font-display text-3xl">{toFulfil}</dd>
          {toFulfil > 0 && <Link to="/admin/orders?status=paid" className="btn-link">Fulfil orders</Link>}
        </div>
        <div className="bg-white p-5">
          <dt className="text-sm text-stone">Customers</dt>
          <dd className="mt-1 font-display text-3xl">{data.customers}</dd>
        </div>
      </dl>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="recent">
          <h2 id="recent" className="font-medium">Recent orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-stone">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-line border-y border-stone-line text-sm">
              {data.recentOrders.map((o) => (
                <li key={o._id} className="flex items-center gap-3 py-3">
                  <Link to={`/orders/${o._id}`} className="font-medium hover:underline">#{o._id.slice(-6).toUpperCase()}</Link>
                  <span className="truncate text-stone">{o.user?.name ?? 'Deleted user'}</span>
                  <span className="text-stone">{formatDate(o.createdAt)}</span>
                  <span className="ml-auto">{formatINR(o.total)}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-stone">
            {Object.entries(data.ordersByStatus).map(([s, n]) => `${ORDER_STATUS[s]?.label ?? s}: ${n}`).join(' · ') || 'No orders'}
          </p>
        </section>

        <section aria-labelledby="low-stock">
          <h2 id="low-stock" className="font-medium">Low stock (5 or fewer)</h2>
          {data.lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-stone">Everything is well stocked.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-line border-y border-stone-line text-sm">
              {data.lowStock.map((p) => (
                <li key={p._id} className="flex justify-between py-3">
                  <Link to={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
                  <span className={p.stock === 0 ? 'font-medium text-madder' : ''}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
