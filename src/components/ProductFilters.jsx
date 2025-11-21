import React, { useState, useCallback, useRef } from 'react';

const ProductFilters = ({ onChange, categories = [] }) => {
  const [text, setText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const debounceRef = useRef(null);

  const emit = useCallback(() => {
    onChange?.({ text, minPrice, maxPrice, activeOnly, categoryId });
  }, [text, minPrice, maxPrice, activeOnly, categoryId, onChange]);

  const debouncedEmit = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(emit, 300);
  }, [emit]);

  return (
    <div className="filters flex flex-wrap gap-3 items-end mb-4">
      <div className="flex flex-col">
        <label className="text-xs font-medium">Buscar</label>
        <input 
          value={text} 
          onChange={(e) => { setText(e.target.value); debouncedEmit(); }} 
          className="border px-2 py-1 rounded" 
          placeholder="Nombre o descripción" 
        />
      </div>
      <div className="flex flex-col w-24">
        <label className="text-xs font-medium">Min $</label>
        <input 
          type="number" 
          value={minPrice} 
          onChange={(e) => { setMinPrice(e.target.value); debouncedEmit(); }} 
          className="border px-2 py-1 rounded" 
        />
      </div>
      <div className="flex flex-col w-24">
        <label className="text-xs font-medium">Max $</label>
        <input 
          type="number" 
          value={maxPrice} 
          onChange={(e) => { setMaxPrice(e.target.value); debouncedEmit(); }} 
          className="border px-2 py-1 rounded" 
        />
      </div>
      <div className="flex flex-col w-40">
        <label className="text-xs font-medium">Categoría</label>
        <select 
          value={categoryId} 
          onChange={(e) => { setCategoryId(e.target.value); emit(); }} 
          className="border px-2 py-1 rounded"
        >
          <option value="">Todas</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          checked={activeOnly} 
          onChange={(e) => { setActiveOnly(e.target.checked); emit(); }} 
        /> Solo activos
      </label>
      <button type="button" onClick={emit} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Filtrar</button>
    </div>
  );
};

export default ProductFilters;
