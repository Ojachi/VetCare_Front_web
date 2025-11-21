import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchProducts, manualPurchase } from '../../api/products';
import axios from '../../api/axios';

const SalesRegisterEmployee = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [draftItems, setDraftItems] = useState([]);
  const [userId, setUserId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [owners, setOwners] = useState([]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await fetchProducts({ active: true });
      setProducts(list);
      setFiltered(list);
      // Cargar usuarios (Owners). Backend devuelve todos los usuarios, filtramos por rol OWNER.
      try {
        const { data: allUsers } = await axios.get('/users');
        setOwners(allUsers.filter(u => (u.role || u.roles?.includes?.('OWNER')) === 'OWNER'));
      } catch {}
    } catch (e) {
      setError('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filterProducts = (value) => {
    setSearch(value);
    const v = value.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(v) || p.description.toLowerCase().includes(v)));
  };

  const addLine = (product) => {
    setDraftItems(items => {
      const existing = items.find(i => i.productId === product.id);
      if (existing) {
        return items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };
  const updateQuantity = (productId, qty) => {
    setDraftItems(items => items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };
  const removeLine = (productId) => setDraftItems(items => items.filter(i => i.productId !== productId));

  const total = draftItems.reduce((acc, it) => acc + (it.quantity * (parseFloat(it.price) || 0)), 0);

  const submit = async (e) => {
    e.preventDefault();
    setSuccess(null); setError(null);
    if (!userId) { setError('Debe indicar ID de cliente'); return; }
    if (draftItems.length === 0) { setError('Debe agregar al menos un producto'); return; }
    setSending(true);
    try {
      const payload = {
        userId: parseInt(userId, 10),
        items: draftItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        notes: notes || ''
      };
      const resp = await manualPurchase(payload);
      setSuccess(`Venta registrada (#${resp.id})`);
      setDraftItems([]);
      setNotes('');
      setPaymentMethod('CASH');
    } catch (e2) {
      setError('Error registrando venta');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-teal text-4xl">point_of_sale</span>
            <h1 className="text-3xl font-bold text-gray-800">Registro de Venta Presencial</h1>
          </div>
          <p className="text-gray-600">Registra ventas para clientes en mostrador</p>
        </div>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4 text-sm">{success}</div>}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 flex items-center gap-2"><span className="material-icons text-teal">inventory_2</span> Productos Disponibles</h3>
            <input
              value={search}
              onChange={(e) => filterProducts(e.target.value)}
              placeholder="Buscar productos"
              className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
            />
          </div>
          {loading && <p className="text-sm text-gray-500">Cargando...</p>}
          {!loading && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => addLine(p)}
                  className="text-left border rounded-lg p-3 hover:border-teal focus:outline-none"
                >
                  <p className="font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">${parseFloat(p.price).toFixed(2)}</p>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-gray-500 col-span-full">Sin productos</p>}
            </div>
          )}
        </div>
        
        <form onSubmit={submit} className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (Owner)</label>
              <select value={userId} onChange={(e) => setUserId(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <option value="">-- Seleccionar Owner --</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.name || o.email} (#{o.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800 flex items-center gap-2"><span className="material-icons text-sm text-teal">shopping_cart</span> Selección</h3>
              {draftItems.length > 0 && (
                <button type="button" onClick={() => setDraftItems([])} className="text-xs text-red-600 hover:underline">Vaciar</button>
              )}
            </div>
            <div className="space-y-2">
              {draftItems.map(line => (
                <div key={line.productId} className="flex gap-2 items-center border rounded-lg px-3 py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{line.name}</p>
                    <p className="text-xs text-gray-500">${parseFloat(line.price).toFixed(2)} c/u</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => updateQuantity(line.productId, parseInt(e.target.value, 10) || 1)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                  <p className="text-sm font-medium w-24 text-right">${(line.quantity * parseFloat(line.price)).toFixed(2)}</p>
                  <button type="button" onClick={() => removeLine(line.productId)} className="text-red-600 hover:text-red-700">
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              ))}
              {draftItems.length === 0 && <p className="text-sm text-gray-500">No hay productos seleccionados.</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" maxLength={500} rows={3} placeholder="Notas adicionales (opcional)" />
          </div>
          
          <div className="flex justify-between items-center border-t pt-4">
            <p className="text-sm text-gray-600">Total: <span className="font-semibold">${total.toFixed(2)}</span></p>
            <button disabled={sending} type="submit" className="flex items-center gap-2 bg-teal hover:bg-teal-dark disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              <span className="material-icons">receipt</span>
              {sending ? 'Registrando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SalesRegisterEmployee;
