import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

// SearchBar Component
interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

function SearchBar({ onSearch, placeholder = "Search by title or ISBN..." }: SearchBarProps) {
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
