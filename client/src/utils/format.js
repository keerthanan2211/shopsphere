const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** Amounts are stored in paise; display them as whole rupees: 249900 → "₹2,499". */
export const formatINR = (paise) => inr.format(Math.round(paise / 100));

export const rupeesToPaise = (rupees) => Math.round(Number(rupees) * 100);

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

export const CATEGORIES = [
  { id: 'textiles', label: 'Textiles' },
  { id: 'brassware', label: 'Brassware' },
  { id: 'ceramics', label: 'Ceramics' },
  { id: 'woodcraft', label: 'Woodcraft' },
  { id: 'lighting', label: 'Lighting' },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const ORDER_STATUS = {
  pending: { label: 'Awaiting payment', tone: 'bg-turmeric/15 text-[#7A5A0C]' },
  paid: { label: 'Paid', tone: 'bg-indigo-soft text-indigo' },
  shipped: { label: 'Shipped', tone: 'bg-indigo-soft text-indigo' },
  delivered: { label: 'Delivered', tone: 'bg-leaf/10 text-leaf' },
  cancelled: { label: 'Cancelled', tone: 'bg-stone-line text-stone' },
};
