import { useSelector } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogoutMutation, useMeQuery } from '../features/api/apiSlice';
import { selectCartCount } from '../features/cart/cartSlice';

const navClass = ({ isActive }) => `text-sm ${isActive ? 'font-medium text-indigo' : 'text-indigo-deep hover:text-indigo'}`;

export default function Layout() {
  const { data: user } = useMeQuery();
  const [logout] = useLogoutMutation();
  const count = useSelector(selectCartCount);
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="border-b border-stone-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link to="/" className="font-display text-2xl text-indigo">
            ShopSphere
          </Link>
          <nav aria-label="Main" className="ml-auto flex items-center gap-5">
            <NavLink to="/" end className={navClass}>
              Shop
            </NavLink>
            {user && (
              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
            {user ? (
              <button type="button" onClick={signOut} className="text-sm text-indigo-deep hover:text-indigo">
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className={navClass}>
                Sign in
              </NavLink>
            )}
            <NavLink to="/cart" className="relative inline-flex h-10 items-center rounded-full bg-indigo px-4 text-sm font-medium text-white hover:bg-indigo-deep">
              Cart
              <span className="ml-2 rounded-full bg-white/20 px-2 text-xs" aria-label={`${count} items`}>
                {count}
              </span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-stone-line">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-stone">
          Made by artisans across India. Free shipping on orders over ₹999.
        </div>
      </footer>
    </div>
  );
}
