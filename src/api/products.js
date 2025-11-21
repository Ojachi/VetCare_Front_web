import axios from './axios';

// PRODUCTOS
// Permite filtros opcionales: { search, active, minPrice, maxPrice, categoryId }
export const fetchProducts = async (params = {}) => {
  const { data } = await axios.get('/products', { params });
  return data; // List<ProductResponseDTO>
};

export const fetchProductById = async (id) => {
  const { data } = await axios.get(`/products/${id}`);
  return data; // ProductResponseDTO
};

export const createProduct = async (payload) => {
  // payload: { name, description, price, image, stock }
  const { data } = await axios.post('/products', payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axios.put(`/products/${id}`, payload);
  return data;
};

export const activateProduct = async (id) => {
  await axios.put(`/products/${id}/activate`);
};

export const deactivateProduct = async (id) => {
  await axios.put(`/products/${id}/deactivate`);
};

export const deleteProduct = async (id) => {
  await axios.delete(`/products/${id}`);
};

// CARRITO (Owner)
export const getCart = async () => {
  const { data } = await axios.get('/cart');
  return data; // CartResponseDTO
};

export const addToCart = async ({ productId, quantity }) => {
  const { data } = await axios.post('/cart/add', { productId, quantity });
  return data; // CartResponseDTO actualizado
};

export const updateCartItem = async (itemId, quantity) => {
  const { data } = await axios.put(`/cart/item/${itemId}`, { quantity });
  return data; // CartResponseDTO actualizado
};

export const removeCartItem = async (itemId) => {
  const { data } = await axios.delete(`/cart/item/${itemId}`);
  return data; // CartResponseDTO actualizado
};

export const clearCart = async () => {
  await axios.delete('/cart/clear');
};

// COMPRAS
// Paginado: backend espera Pageable => usar params ?page=0&size=10&sort=purchaseDate,desc
export const fetchMyPurchases = async (params = {}) => {
  const { data } = await axios.get('/purchases', { params });
  return data; // Page<PurchaseResponseDTO>
};

export const purchaseBuyNow = async ({ productId, quantity, notes }) => {
  const { data } = await axios.post('/purchases/buy-now', { productId, quantity, notes });
  return data; // PurchaseResponseDTO
};

export const purchaseFromCart = async () => {
  const { data } = await axios.post('/purchases/from-cart');
  return data; // PurchaseResponseDTO
};

export const completePurchase = async (purchaseId) => {
  const { data } = await axios.put(`/purchases/${purchaseId}/complete`);
  return data;
};

export const cancelPurchase = async (purchaseId) => {
  const { data } = await axios.put(`/purchases/${purchaseId}/cancel`);
  return data;
};

export const fetchPurchaseById = async (purchaseId) => {
  const { data } = await axios.get(`/purchases/${purchaseId}`);
  return data;
};

// CATEGORÍAS
export const fetchCategories = async () => {
  const { data } = await axios.get('/categories');
  return data; // List<CategoryResponseDTO>
};

export const fetchCategoryById = async (id) => {
  const { data } = await axios.get(`/categories/${id}`);
  return data; // CategoryResponseDTO
};

export const createCategory = async (payload) => {
  // payload: { name, description }
  const { data } = await axios.post('/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await axios.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  await axios.delete(`/categories/${id}`);
};

// COMPRAS GLOBALES (Admin / Employee)
// Filtros: { page, size, status, userId, startDate, endDate }
export const fetchAllPurchases = async (filters = {}) => {
  const params = { ...filters };
  const { data } = await axios.get('/purchases/all', { params });
  return data; // Page<PurchaseResponseDTO>
};

// VENTA / COMPRA MANUAL (registro presencial)
// payload: { userId, items: [{ productId, quantity }], paymentMethod, notes }
export const manualPurchase = async (payload) => {
  const { data } = await axios.post('/purchases/manual', payload);
  return data; // PurchaseResponseDTO
};

// ESTADÍSTICAS DE VENTAS
export const fetchPurchaseStatistics = async () => {
  const { data } = await axios.get('/purchases/statistics');
  return data; // { totalSales, totalRevenue, monthlyRevenue, topProducts, ... }
};

// NOTA: Endpoints extendidos para categorías, compras globales, venta manual, estadísticas y desactivación de productos.
