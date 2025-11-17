import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const initialValues = useMemo(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  }), [user]);

  useEffect(() => {
    if (!user) return;
    setFormData(initialValues);
    setLoading(false);
  }, [user, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialValues);
    setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setFeedback(null);

    const payload = {
      name: formData.name?.trim() || '',
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
    };

    try {
      const response = await authApi.updateProfile(user.id, payload);
      const updatedUser = response.data;
      updateUser(updatedUser);
      setFormData({
        name: updatedUser.name || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
      });
      setFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'No se pudo actualizar tu perfil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Administra tu información personal y de contacto.</p>
        </div>

        {feedback && (
          <div className={`mb-4 text-sm rounded-md px-4 py-3 ${feedback.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-red-100 text-red-600'}`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-teal/10 text-teal flex items-center justify-center text-3xl font-semibold mb-3">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name || 'Usuario'}</h2>
                <p className="text-sm text-gray-500 capitalize mt-1">{user?.role?.toLowerCase()}</p>
                <p className="text-sm text-gray-500 mt-4">{user?.email}</p>
                <span className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${user?.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {user?.active ? 'Cuenta activa' : 'Cuenta inactiva'}
                </span>
              </div>
              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-gray-400 text-xl">call</span>
                  <span>{user?.phone || 'Sin teléfono registrado'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-icons text-gray-400 text-xl">location_on</span>
                  <span>{user?.address || 'Sin dirección registrada'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={255}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">El correo se gestiona desde el área administrativa.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={40}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                      placeholder="Número de contacto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={255}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-teal"
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={saving}
                  >
                    Restablecer
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 md:flex-none px-4 py-2 bg-teal text-white rounded-lg shadow-teal-sm hover:shadow-teal-lg disabled:opacity-60"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;

