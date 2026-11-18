import { useState } from 'react';
import { FormError, ErrorState, Loading } from '../../components/PageState';
import { useCreateProductMutation, useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from '../../features/api/apiSlice';
import { CATEGORIES, categoryLabel, formatINR, rupeesToPaise } from '../../utils/format';

const EMPTY = { name: '', description: '', category: 'textiles', origin: '', price: '', stock: '', image: '', featured: false };

export default function ProductsAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetProductsQuery({ page, limit: 20, sort: 'newest' });
  const [editing, setEditing] = useState(null); // null = closed, EMPTY = new, product = edit
  const [remove] = useDeleteProductMutation();

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone">{data.total} products</p>
        <button type="button" className="btn-primary h-10" onClick={() => setEditing(EMPTY)}>Add product</button>
      </div>

      {editing && <ProductForm initial={editing} onDone={() => setEditing(null)} />}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-line text-stone">
            <tr>
              <th scope="col" className="py-2 font-normal">Name</th>
              <th scope="col" className="py-2 font-normal">Category</th>
              <th scope="col" className="py-2 text-right font-normal">Price</th>
              <th scope="col" className="py-2 text-right font-normal">Stock</th>
              <th scope="col" className="py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-line">
            {data.products.map((p) => (
              <tr key={p._id}>
                <td className="py-3 font-medium">{p.name}</td>
                <td className="py-3">{categoryLabel(p.category)}</td>
                <td className="py-3 text-right">{formatINR(p.price)}</td>
                <td className={`py-3 text-right ${p.stock <= 5 ? 'font-medium text-madder' : ''}`}>{p.stock}</td>
                <td className="py-3 text-right">
                  <button type="button" className="btn-link mr-4" onClick={() => setEditing(p)}>Edit<span className="sr-only"> {p.name}</span></button>
                  <button
                    type="button"
                    className="text-sm text-stone underline hover:text-madder"
                    onClick={() => window.confirm(`Delete ${p.name}? Past orders keep their copy of it.`) && remove(p._id)}
                  >
                    Delete<span className="sr-only"> {p.name}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-secondary h-9" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <button type="button" className="btn-secondary h-9" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, onDone }) {
  const isNew = !initial._id;
  const [values, setValues] = useState(
    isNew ? EMPTY : { ...EMPTY, ...initial, price: String(initial.price / 100), stock: String(initial.stock), origin: initial.origin ?? '' },
  );
  const [create, createState] = useCreateProductMutation();
  const [update, updateState] = useUpdateProductMutation();
  const state = isNew ? createState : updateState;

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      origin: values.origin.trim() || undefined,
      price: rupeesToPaise(values.price),
      stock: Number.parseInt(values.stock, 10),
      image: values.image.trim(),
      featured: values.featured,
    };
    try {
      if (isNew) await create(body).unwrap();
      else await update({ id: initial._id, ...body }).unwrap();
      onDone();
    } catch {
      /* shown below */
    }
  };

  return (
    <form onSubmit={submit} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2" aria-label={isNew ? 'New product' : `Edit ${initial.name}`}>
      <h2 className="font-medium sm:col-span-2">{isNew ? 'New product' : `Edit ${initial.name}`}</h2>
      <div className="sm:col-span-2">
        <label htmlFor="p-name" className="label">Name</label>
        <input id="p-name" className="input" required minLength={2} value={values.name} onChange={set('name')} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-desc" className="label">Description</label>
        <textarea id="p-desc" className="input h-auto py-2" rows={3} required minLength={10} value={values.description} onChange={set('description')} />
      </div>
      <div>
        <label htmlFor="p-cat" className="label">Category</label>
        <select id="p-cat" className="input" value={values.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="p-origin" className="label">Made in</label>
        <input id="p-origin" className="input" placeholder="Jaipur, Rajasthan" value={values.origin} onChange={set('origin')} />
      </div>
      <div>
        <label htmlFor="p-price" className="label">Price (₹)</label>
        <input id="p-price" className="input" type="number" min="0" step="1" required value={values.price} onChange={set('price')} />
      </div>
      <div>
        <label htmlFor="p-stock" className="label">Stock</label>
        <input id="p-stock" className="input" type="number" min="0" step="1" required value={values.stock} onChange={set('stock')} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p-image" className="label">Image URL (optional)</label>
        <input id="p-image" className="input" type="url" placeholder="https://…" value={values.image} onChange={set('image')} />
        <p className="mt-1 text-xs text-stone">Leave empty to use a generated pattern tile.</p>
      </div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={values.featured} onChange={set('featured')} className="h-4 w-4 accent-indigo" />
        Feature on the home page
      </label>
      <div className="sm:col-span-2"><FormError error={state.error} /></div>
      <div className="flex gap-3 sm:col-span-2">
        <button type="submit" className="btn-primary h-10" disabled={state.isLoading}>{state.isLoading ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}</button>
        <button type="button" className="btn-secondary h-10" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}
