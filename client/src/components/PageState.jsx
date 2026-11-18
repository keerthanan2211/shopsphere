import { errorMessage } from '../features/api/apiSlice';

export function Loading({ label = 'Loading…' }) {
  return (
    <p role="status" className="py-24 text-center text-sm text-stone">
      {label}
    </p>
  );
}

export function ErrorState({ error, title = 'This page couldn’t load' }) {
  return (
    <div role="alert" className="py-24 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-stone">{errorMessage(error)}</p>
    </div>
  );
}

export function FormError({ error }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-madder/10 px-3 py-2 text-sm text-madder">
      {typeof error === 'string' ? error : errorMessage(error)}
    </p>
  );
}
