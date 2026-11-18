import { NavLink, Outlet } from 'react-router-dom';

const tab = ({ isActive }) => `border-b-2 px-1 pb-3 text-sm ${isActive ? 'border-indigo font-medium text-indigo' : 'border-transparent text-stone hover:text-indigo-deep'}`;

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl">Store admin</h1>
      <nav aria-label="Admin" className="mt-6 flex gap-6 border-b border-stone-line">
        <NavLink to="/admin" end className={tab}>Overview</NavLink>
        <NavLink to="/admin/products" className={tab}>Products</NavLink>
        <NavLink to="/admin/orders" className={tab}>Orders</NavLink>
      </nav>
      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}
