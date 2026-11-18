import { Link, useSearchParams } from 'react-router-dom';
import { ErrorState, FormError, Loading } from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { useAdminOrdersQuery, useUpdateOrderStatusMutation } from '../../features/api/apiSlice';
import { formatDate, formatINR, ORDER_STATUS } from '../../utils/format';

// Mirrors the server's allowed transitions, so admins only see valid next steps
const NEXT = { pending: ['paid', 'cancelled'], paid: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };

export default function OrdersAdminPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const { data: orders, isLoading, error } = useAdminOrdersQuery(status);
  const [updateStatus, updateState] = useUpdateOrderStatusMutation();

  return (
    <div>
      <label htmlFor="status-filter" className="label">Show</label>
      <select id="status-filter" className="input w-56" value={status} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}>
        <option value="">All orders</option>
        {Object.entries(ORDER_STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
      </select>

      <div className="mt-4"><FormError error={updateState.error} /></div>
      {isLoading && <Loading />}
      {error && <ErrorState error={error} />}

      {orders && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-line text-stone">
              <tr>
                <th scope="col" className="py-2 font-normal">Order</th>
                <th scope="col" className="py-2 font-normal">Customer</th>
                <th scope="col" className="py-2 font-normal">Date</th>
                <th scope="col" className="py-2 text-right font-normal">Total</th>
                <th scope="col" className="py-2 font-normal">Status</th>
                <th scope="col" className="py-2 font-normal">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-line">
              {orders.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-stone">No orders with this status.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="py-3"><Link to={`/orders/${o._id}`} className="font-medium hover:underline">#{o._id.slice(-6).toUpperCase()}</Link></td>
                  <td className="py-3">{o.user?.name ?? 'Deleted user'}</td>
                  <td className="py-3">{formatDate(o.createdAt)}</td>
                  <td className="py-3 text-right">{formatINR(o.total)}</td>
                  <td className="py-3"><StatusBadge status={o.status} /></td>
                  <td className="py-3">
                    {NEXT[o.status].length === 0 ? (
                      <span className="text-stone">Complete</span>
                    ) : (
                      <div className="flex gap-2">
                        {NEXT[o.status].map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={updateState.isLoading}
                            onClick={() => updateStatus({ id: o._id, status: s })}
                            className={s === 'cancelled' ? 'text-xs text-stone underline hover:text-madder' : 'btn-secondary h-8 px-3 text-xs'}
                          >
                            {s === 'cancelled' ? 'Cancel' : `Mark ${ORDER_STATUS[s].label.toLowerCase()}`}
                            <span className="sr-only"> order {o._id.slice(-6)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
