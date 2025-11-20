import React, { useEffect, useMemo, useRef, useState } from 'react';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Selecciona una opción',
  emptyStateMessage,
  valueKey = 'id',
  getOptionLabel = (option) => option?.label ?? '',
  getOptionSecondary,
  getSearchableText,
  sort = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const normalizedValue = value === null || value === undefined ? '' : String(value);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const normalizedOptions = useMemo(() => {
    const prepared = options
      .filter(Boolean)
      .map((option) => {
        const rawValue = option?.[valueKey];
        const optionValue = rawValue === null || rawValue === undefined ? '' : String(rawValue);
        const label = getOptionLabel(option) || '';
        const searchable = (
          (getSearchableText ? getSearchableText(option) : label) || ''
        ).toLowerCase();

        return {
          option,
          value: optionValue,
          label,
          searchable,
        };
      });

    if (!sort) return prepared;
    return prepared.sort((a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })
    );
  }, [options, valueKey, getOptionLabel, getSearchableText, sort]);

  const filteredOptions = normalizedSearch
    ? normalizedOptions.filter((opt) => opt.searchable.includes(normalizedSearch))
    : normalizedOptions;

  const selectedOption = normalizedOptions.find((opt) => opt.value === normalizedValue);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    const rawValue = opt?.option?.[valueKey];
    onChange(rawValue ?? '');
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
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
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
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

  const resolvedPlaceholder =
    selectedOption?.label || (!disabled ? placeholder : 'No disponible');

  const resolvedEmptyMessage = (() => {
    if (typeof emptyStateMessage === 'function') {
      return emptyStateMessage(searchTerm);
    }
    if (typeof emptyStateMessage === 'string' && emptyStateMessage.length > 0) {
      return emptyStateMessage;
    }
    if (searchTerm) {
      return `No se encontraron coincidencias para "${searchTerm}"`;
    }
    return 'No hay opciones disponibles';
  })();

  return (
    <div ref={wrapperRef} className={`relative ${className}`.trim()}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : (selectedOption?.label || '')}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          required={required && !selectedOption}
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

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((opt, index) => (
            <div
              key={`${opt.value}-${index}`}
              onClick={() => handleSelect(opt)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                highlightedIndex === index
                  ? 'bg-teal text-white'
                  : normalizedValue === opt.value
                  ? 'bg-teal/10 text-teal'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              {getOptionSecondary && (
                <div
                  className={`text-xs ${
                    highlightedIndex === index ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  {getOptionSecondary(opt.option)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
          {resolvedEmptyMessage}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;

