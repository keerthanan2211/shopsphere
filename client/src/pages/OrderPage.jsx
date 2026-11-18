import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, FormError, Loading } from '../components/PageState';
import StatusBadge from '../components/StatusBadge';
import { useCancelOrderMutation, useGetOrderQuery, usePayOrderMutation } from '../features/api/apiSlice';
import { formatDate, formatINR } from '../utils/format';
import { Totals } from './CartPage';

const STEPS = ['pending', 'paid', 'shipped', 'delivered'];

export default function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data, isLoading, error } = useGetOrderQuery(id);
  const [pay, payState] = usePayOrderMutation();
  const [cancel, cancelState] = useCancelOrderMutation();

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} title="Order not found" />;

  const { order, paymentMode } = data;
  const stepIndex = STEPS.indexOf(order.status);
  const a = order.shippingAddress;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {params.get('payment') === 'success' && order.status === 'pending' && (
        <p role="status" className="mb-6 rounded-lg bg-indigo-soft px-4 py-3 text-sm">Payment received. Confirming with the bank, this page will update shortly.</p>
      )}
      {params.get('payment') === 'cancelled' && order.status === 'pending' && (
        <p role="status" className="mb-6 rounded-lg bg-turmeric/15 px-4 py-3 text-sm">Payment was cancelled. Your items are reserved, so you can try again.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-stone">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.status !== 'cancelled' && (
        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className="text-xs">
              <span className={`mb-2 block h-1.5 rounded-full ${i <= stepIndex ? 'bg-indigo' : 'bg-stone-line'}`} aria-hidden />
              <span className={i <= stepIndex ? 'font-medium' : 'text-stone'}>
                {{ pending: 'Placed', paid: 'Paid', shipped: 'Shipped', delivered: 'Delivered' }[s]}
              </span>
              {i === stepIndex && <span className="sr-only"> (current step)</span>}
            </li>
          ))}
        </ol>
      )}

      {order.status === 'pending' && paymentMode === 'mock' && (
        <div className="card mt-8 p-5">
          <p className="font-medium">Complete your payment</p>
          <p className="mt-1 text-sm text-stone">This demo store uses a simulated payment, so no card is needed.</p>
          <FormError error={payState.error} />
          <button type="button" className="btn-primary mt-4" onClick={() => pay(order._id)} disabled={payState.isLoading}>
            {payState.isLoading ? 'Processing…' : `Pay ${formatINR(order.total)} (demo)`}
          </button>
        </div>
      )}

      <section aria-labelledby="items" className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 id="items" className="font-medium">Items</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.product} className="flex justify-between gap-3">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <Totals totals={order} />
        </div>
        <div>
          <h2 className="font-medium">Delivering to</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-stone">
            {a.fullName}<br />{a.line1}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}
          </address>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-stone-line pt-6">
        <Link to="/orders" className="btn-secondary">All orders</Link>
        {['pending', 'paid'].includes(order.status) && (
          <button
            type="button"
            className="text-sm text-stone underline hover:text-madder"
            disabled={cancelState.isLoading}
            onClick={() => window.confirm('Cancel this order? Items go back into stock.') && cancel(order._id)}
          >
            Cancel order
          </button>
        )}
        <FormError error={cancelState.error} />
      </div>
    </div>
  );
}
