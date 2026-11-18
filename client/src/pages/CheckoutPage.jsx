import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { FormError } from '../components/PageState';
import { useCreateOrderMutation, useMeQuery } from '../features/api/apiSlice';
import { clearCart, selectCartItems, selectCartSubtotal } from '../features/cart/cartSlice';
import { estimateTotals } from '../utils/totals';
import { Totals } from './CartPage';

const FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'phone', label: 'Mobile number', autoComplete: 'tel-national', inputMode: 'numeric', hint: '10 digits, used for delivery updates' },
  { name: 'line1', label: 'Address', autoComplete: 'street-address', wide: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'PIN code', autoComplete: 'postal-code', inputMode: 'numeric' },
];

/** Client-side checks give instant feedback; the server validates the same rules again. */
function validate(values) {
  const errors = {};
  if (values.fullName.trim().length < 2) errors.fullName = 'Enter the name for delivery';
  if (!/^[6-9]\d{9}$/.test(values.phone.trim())) errors.phone = 'Enter a 10-digit Indian mobile number';
  if (values.line1.trim().length < 3) errors.line1 = 'Enter your house number and street';
  if (values.city.trim().length < 2) errors.city = 'Enter your city';
  if (values.state.trim().length < 2) errors.state = 'Enter your state';
  if (!/^\d{6}$/.test(values.postalCode.trim())) errors.postalCode = 'PIN code must be 6 digits';
  return errors;
}

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { data: user } = useMeQuery();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: user?.name ?? '', phone: '', line1: '', city: '', state: '', postalCode: '' });
  const [errors, setErrors] = useState({});

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    try {
      const res = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])),
      }).unwrap();
      dispatch(clearCart());
      if (res.checkoutUrl) window.location.assign(res.checkoutUrl); // Stripe hosted checkout
      else navigate(`/orders/${res.order._id}`);
    } catch {
      /* error shown via FormError */
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} noValidate aria-labelledby="checkout-heading">
        <h1 id="checkout-heading" className="font-display text-3xl">Delivery details</h1>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.wide ? 'sm:col-span-2' : ''}>
              <label htmlFor={f.name} className="label">{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                className="input"
                autoComplete={f.autoComplete}
                inputMode={f.inputMode}
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] || f.hint ? `${f.name}-msg` : undefined}
              />
              {(errors[f.name] || f.hint) && (
                <p id={`${f.name}-msg`} className={`mt-1 text-xs ${errors[f.name] ? 'text-madder' : 'text-stone'}`}>
                  {errors[f.name] ?? f.hint}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <FormError error={error} />
        </div>
        <button type="submit" className="btn-primary mt-6" disabled={isLoading}>
          {isLoading ? 'Placing order…' : 'Place order and pay'}
        </button>
      </form>

      <aside className="card h-fit p-6" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-medium">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-stone">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="truncate">{i.name}</span>
              <span>× {i.quantity}</span>
            </li>
          ))}
        </ul>
        <Totals totals={estimateTotals(subtotal)} />
      </aside>
    </div>
  );
}
