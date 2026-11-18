import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FormError } from '../components/PageState';
import { useLoginMutation, useMeQuery, useRegisterMutation } from '../features/api/apiSlice';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { data: user } = useMeQuery();
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const { isLoading, error } = isRegister ? registerState : loginState;
  const navigate = useNavigate();
  const from = useLocation().state?.from ?? '/';
  const [values, setValues] = useState({ name: '', email: '', password: '' });

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) await register(values).unwrap();
      else await login({ email: values.email, password: values.password }).unwrap();
      navigate(from, { replace: true });
    } catch {
      /* shown below */
    }
  };

  const field = (name, label, props) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} className="input" required value={values[name]} onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))} {...props} />
    </div>
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl">{isRegister ? 'Create an account' : 'Welcome back'}</h1>
      <p className="mt-1 text-sm text-stone">{isRegister ? 'Track orders and leave reviews.' : 'Sign in to check out and see your orders.'}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {isRegister && field('name', 'Name', { autoComplete: 'name', minLength: 2 })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
        {field('password', 'Password', { type: 'password', autoComplete: isRegister ? 'new-password' : 'current-password', minLength: isRegister ? 8 : 1 })}
        <FormError error={error} />
        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone">
        {isRegister ? 'Already have an account? ' : 'New here? '}
        <Link to={isRegister ? '/login' : '/register'} state={{ from }} className="btn-link">
          {isRegister ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
      {!isRegister && (
        <p className="mt-4 text-xs text-stone">Demo: customer@shopsphere.dev / Shop#2026 · admin@shopsphere.dev / Admin#2026</p>
      )}
    </div>
  );
}
