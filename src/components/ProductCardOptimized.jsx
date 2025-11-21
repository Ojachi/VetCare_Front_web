import React, { memo } from 'react';

const ProductCard = ({ product, role, onAddToCart, onEdit, onDelete, onActivate, onSelect }) => {
  if (!product) return null;
  const { id, name, description, price, image, stock, active } = product;

  return (
    <div className={`product-card border rounded p-3 shadow-sm flex flex-col gap-2 ${!active ? 'opacity-60' : ''}`}>      
      {image && (
        <img 
          src={image} 
          alt={name} 
          className="h-40 object-cover w-full rounded" 
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      <div className="flex justify-between text-sm mt-auto">
        <span className="font-medium">${price}</span>
        <span>Stock: {stock}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <button onClick={() => onSelect?.(id)} className="text-blue-600 text-sm underline">Detalle</button>
        {role === 'OWNER' && active && stock > 0 && (
          <button onClick={() => onAddToCart?.(id)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Agregar</button>
        )}
        {(role === 'ADMIN' || role === 'EMPLOYEE') && (
          <>
            <button onClick={() => onEdit?.(product)} className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Editar</button>
            {active ? (
              <button onClick={() => onDelete?.(id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Eliminar</button>
            ) : (
              <button onClick={() => onActivate?.(id)} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">Activar</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ProductCard);