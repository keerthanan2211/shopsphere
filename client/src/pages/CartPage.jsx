import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CraftTile from '../components/CraftTile';
import QuantityStepper from '../components/QuantityStepper';
import { MAX_QTY, removeItem, selectCartItems, selectCartSubtotal, setQuantity } from '../features/cart/cartSlice';
import { formatINR } from '../utils/format';
import { estimateTotals } from '../utils/totals';

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const totals = estimateTotals(subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-stone">Find something handmade for your home.</p>
        <Link to="/" className="btn-primary mt-6">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <section aria-labelledby="cart-heading">
        <h1 id="cart-heading" className="font-display text-3xl">Your cart</h1>
        <ul className="mt-6 divide-y divide-stone-line border-y border-stone-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5">
              <Link to={`/products/${item.slug}`} className="w-24 shrink-0 overflow-hidden rounded-lg">
                <CraftTile product={item} />
              </Link>
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Link to={`/products/${item.slug}`} className="font-medium hover:underline">{item.name}</Link>
                  <p className="text-sm text-stone">{formatINR(item.price)} each</p>
                </div>
                <QuantityStepper
                  label={`Quantity of ${item.name}`}
                  value={item.quantity}
                  max={Math.min(MAX_QTY, item.stock)}
                  onChange={(q) => dispatch(setQuantity({ productId: item.productId, quantity: q }))}
                />
                <div className="text-right sm:w-24">
                  <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
                  <button type="button" className="mt-1 text-xs text-stone underline hover:text-madder" onClick={() => dispatch(removeItem(item.productId))}>
                    Remove<span className="sr-only"> {item.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="card h-fit p-6" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-medium">Order summary</h2>
        <Totals totals={totals} />
        <Link to="/checkout" className="btn-primary mt-6 w-full">Continue to checkout</Link>
        <p className="mt-3 text-xs text-stone">Final prices are confirmed at checkout.</p>
      </aside>
    </div>
  );
}

export function Totals({ totals }) {
  return (
    <dl className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
      <div className="flex justify-between"><dt>Shipping</dt><dd>{totals.shipping ? formatINR(totals.shipping) : 'Free'}</dd></div>
      <div className="flex justify-between"><dt>GST (12%)</dt><dd>{formatINR(totals.tax)}</dd></div>
      <div className="flex justify-between border-t border-stone-line pt-2 text-base font-medium"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
    </dl>
  );
}
