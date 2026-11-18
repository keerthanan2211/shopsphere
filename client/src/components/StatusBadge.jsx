import { ORDER_STATUS } from '../utils/format';

export default function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? { label: status, tone: 'bg-stone-line' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.tone}`}>{s.label}</span>;
}
