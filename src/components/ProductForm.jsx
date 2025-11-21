import React, { useState, useEffect } from 'react';

const initial = { name: '', description: '', price: '', stock: '', image: '', categoryId: '' };

const ProductForm = ({ product, onSubmit, onCancel, categories = [] }) => {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        image: product.image || '',
        categoryId: product.categoryId || product.category?.id || ''
      });
    } else {
      setForm(initial);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-xs font-medium">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} required maxLength={100} className="border w-full px-2 py-1 rounded" />
      </div>
      <div>
        <label className="text-xs font-medium">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} required maxLength={500} className="border w-full px-2 py-1 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium">Precio</label>
          <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className="border w-full px-2 py-1 rounded" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium">Stock</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} required min={0} className="border w-full px-2 py-1 rounded" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium">Categoría</label>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} className="border w-full px-2 py-1 rounded">
          <option value="">-- Seleccionar --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Imagen (PNG/JPEG)</label>
        <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
        {form.image && <img src={form.image} alt="preview" className="h-24 mt-2 object-cover rounded" />}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded border">Cancelar</button>
        <button disabled={loading} type="submit" className="px-3 py-1 rounded bg-green-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
};

export default ProductForm;
