import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchAllPurchases, completePurchase, cancelPurchase } from '../../api/products';

// Tabla simple reutilizable interna
const PurchasesTable = ({ data, onComplete, onCancel }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Cliente</th>
            <th className="px-3 py-2 text-left">Total</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-500">Sin resultados</td>
            </tr>
          )}
          {data.map(p => (
            <tr key={p.id} className="border-b last:border-b-0 hover:bg-gray-50">
              <td className="px-3 py-2 font-mono text-xs">{p.id}</td>
              <td className="px-3 py-2">{new Date(p.purchaseDate).toLocaleString()}</td>
              <td className="px-3 py-2">{p.userEmail || `ID: ${p.userId}`}</td>
              <td className="px-3 py-2">${p.totalAmount?.toFixed(2)}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : p.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
              </td>
              <td className="px-3 py-2 flex gap-2">
                {p.status === 'PENDING' && (
                  <>
                    <button onClick={() => onComplete(p.id)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Completar</button>
                    <button onClick={() => onCancel(p.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Cancelar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SalesHistory = () => {
  const [items, setItems] = useState([]); // contenido de la página
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async (override = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: override.page ?? pageInfo.page,
        size: pageInfo.size,
        status: status || undefined,
        userId: userId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      const data = await fetchAllPurchases(params);
      setItems(data.content || []);
      setPageInfo({
        page: data.number,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      });
    } catch (e) {
      setError('Error cargando ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyFilters = () => {
    // Reinicia a página 0 con filtros
    load({ page: 0 });
  };

  const changePage = (delta) => {
    const next = pageInfo.page + delta;
    if (next < 0 || next >= pageInfo.totalPages) return;
    load({ page: next });
  };

  const handleComplete = async (id) => {
    if (!window.confirm('¿Marcar venta como completada?')) return;
    try {
      await completePurchase(id);
      load();
    } catch {
      alert('Error completando');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Cancelar venta?')) return;
    try {
      await cancelPurchase(id);
      load();
    } catch {
      alert('Error cancelando');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-icons text-teal text-4xl">receipt_long</span>
            <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas (Global)</h1>
          </div>
          <p className="text-gray-600">Revisa todas las ventas del sistema</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded">
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium">Cliente (userId)</label>
              <input value={userId} onChange={(e) => setUserId(e.target.value)} className="border px-2 py-1 rounded" placeholder="ID usuario" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium">Hasta</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
            </div>
            <div className="flex flex-col justify-end">
              <button onClick={applyFilters} className="bg-teal text-white px-3 py-2 rounded text-sm font-medium">Aplicar</button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
          </div>
        )}
        {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4 text-sm">{error}</p>}

        {!loading && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <PurchasesTable data={items} onComplete={handleComplete} onCancel={handleCancel} />
            <div className="flex items-center justify-between mt-4 text-sm">
              <div>
                Página {pageInfo.page + 1} de {pageInfo.totalPages} &bull; {pageInfo.totalElements} ventas
              </div>
              <div className="flex gap-2">
                <button onClick={() => changePage(-1)} disabled={pageInfo.page === 0} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
                <button onClick={() => changePage(1)} disabled={pageInfo.page + 1 >= pageInfo.totalPages} className="px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SalesHistory;
