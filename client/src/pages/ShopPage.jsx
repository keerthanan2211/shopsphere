import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ErrorState, Loading } from '../components/PageState';
import ProductCard from '../components/ProductCard';
import { useGetProductsQuery } from '../features/api/apiSlice';
import { CATEGORIES } from '../utils/format';

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
];

/** Filters live in the URL (?category=ceramics&sort=price-asc) so results are shareable and survive refresh. */
export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? '';
  const [searchText, setSearchText] = useState(search);

  useEffect(() => setSearchText(search), [search]);

  const query = { sort, page, ...(category && { category }), ...(search && { search }) };
  const { data, isLoading, isFetching, error } = useGetProductsQuery(query);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-14">
        <h1 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Handmade for the home, by India’s craft clusters</h1>
        <p className="mt-4 max-w-xl text-stone">
          Block-printed textiles from Kutch, brass from Moradabad, blue pottery from Jaipur. Every piece names the place it was made.
        </p>
      </section>

      <div className="flex flex-col gap-4 border-y border-stone-line py-4 lg:flex-row lg:items-center">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ id: '', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id || 'all'}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => update({ category: c.id })}
              className={`rounded-full border px-4 py-1.5 text-sm ${category === c.id ? 'border-indigo bg-indigo text-white' : 'border-stone-line hover:border-indigo'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <form
          className="flex flex-1 gap-2 lg:justify-end"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchText.trim() });
          }}
        >
          <label htmlFor="search" className="sr-only">
            Search products
          </label>
          <input id="search" type="search" className="input h-10 max-w-xs" placeholder="Search brass, ikat, lamp…" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select id="sort" className="input h-10 w-auto" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      {isLoading && <Loading label="Loading products…" />}
      {error && <ErrorState error={error} title="Products couldn’t load" />}

      {data && (
        <>
          <p className="mt-6 text-sm text-stone" aria-live="polite">
            {data.total} {data.total === 1 ? 'product' : 'products'}
            {search && <> matching “{search}”</>}
            {isFetching && ' (updating…)'}
          </p>

          {data.products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-medium">Nothing matches those filters</p>
              <button type="button" className="btn-link mt-2" onClick={() => setParams({})}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {data.products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {data.pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-4">
              <button type="button" className="btn-secondary h-10" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>
                Previous
              </button>
              <span className="text-sm text-stone">
                Page {page} of {data.pages}
              </span>
              <button type="button" className="btn-secondary h-10" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
