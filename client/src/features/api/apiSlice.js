import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query API layer: caching, loading states and automatic refetching via tags.
 * credentials: 'include' sends the httpOnly session cookie with every request.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL ?? ''}/api`, credentials: 'include' }),
  tagTypes: ['Me', 'Product', 'Order', 'Stats'],
  endpoints: (build) => ({
    // Auth
    me: build.query({
      query: () => '/auth/me',
      transformResponse: (res) => res.user,
      providesTags: ['Me'],
    }),
    login: build.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }), invalidatesTags: ['Me', 'Order'] }),
    register: build.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }), invalidatesTags: ['Me'] }),
    logout: build.mutation({ query: () => ({ url: '/auth/logout', method: 'POST' }), invalidatesTags: ['Me', 'Order', 'Stats'] }),

    // Catalogue
    getProducts: build.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: (res) => [...(res?.products ?? []).map((p) => ({ type: 'Product', id: p._id })), { type: 'Product', id: 'LIST' }],
    }),
    getProduct: build.query({
      query: (slug) => `/products/${slug}`,
      transformResponse: (res) => res.product,
      providesTags: (p) => [{ type: 'Product', id: p?._id }],
    }),
    addReview: build.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}/reviews`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }],
    }),

    // Orders
    createOrder: build.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', { type: 'Product', id: 'LIST' }],
    }),
    myOrders: build.query({ query: () => '/orders/mine', transformResponse: (r) => r.orders, providesTags: ['Order'] }),
    getOrder: build.query({ query: (id) => `/orders/${id}`, providesTags: (_r, _e, id) => [{ type: 'Order', id }] }),
    payOrder: build.mutation({ query: (id) => ({ url: `/orders/${id}/pay`, method: 'POST' }), invalidatesTags: ['Order', 'Stats'] }),
    cancelOrder: build.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Order', 'Stats', { type: 'Product', id: 'LIST' }],
    }),

    // Admin
    adminStats: build.query({ query: () => '/admin/stats', providesTags: ['Stats'] }),
    adminOrders: build.query({
      query: (status) => ({ url: '/admin/orders', params: status ? { status } : undefined }),
      transformResponse: (r) => r.orders,
      providesTags: ['Order'],
    }),
    updateOrderStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Order', 'Stats'],
    }),
    createProduct: build.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Stats'],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }, 'Stats'],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Stats'],
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useAddReviewMutation,
  useCreateOrderMutation,
  useMyOrdersQuery,
  useGetOrderQuery,
  usePayOrderMutation,
  useCancelOrderMutation,
  useAdminStatsQuery,
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;

/** Pulls a readable message out of an RTK Query error. */
export const errorMessage = (err) =>
  err?.data?.message ?? (err?.status === 'FETCH_ERROR' ? 'Can’t reach the server. Check your connection.' : 'Something went wrong. Try again.');
