import React, { useState, useEffect, useRef } from 'react';

const ServiceSelector = ({ services, value, onChange, required = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Ordenar servicios alfabéticamente
  const sortedServices = [...services].sort((a, b) => 
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  );

  // Filtrar servicios según búsqueda
  const filteredServices = sortedServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar el servicio seleccionado
  const selectedService = services.find(s => s.id === Number(value));

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (serviceId) => {
    onChange(serviceId);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredServices.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredServices[highlightedIndex]) {
          handleSelect(filteredServices[highlightedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selectedService?.name || '')}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedService ? selectedService.name : "Buscar o seleccionar servicio..."}
          disabled={disabled}
          required={required}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-xl">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {isOpen && filteredServices.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              onClick={() => handleSelect(service.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                highlightedIndex === index
                  ? 'bg-teal text-white'
                  : value === service.id
                  ? 'bg-teal/10 text-teal'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{service.name}</div>
              {service.price && (
                <div className={`text-xs ${highlightedIndex === index ? 'text-white/90' : 'text-gray-500'}`}>
                  ${new Intl.NumberFormat('es-CO').format(service.price)} COP
                  {service.durationMinutes && ` • ${service.durationMinutes} min`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredServices.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
          No se encontraron servicios que coincidan con "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;
