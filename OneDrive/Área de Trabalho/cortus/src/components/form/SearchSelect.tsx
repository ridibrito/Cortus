"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SearchSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  searchPlaceholder?: string;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  placeholder = "Selecione uma opção",
  onChange,
  className = "",
  defaultValue = "",
  value,
  searchPlaceholder = "Buscar...",
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Se não houver opções, mostrar mensagem
  if (options.length === 0) {
    return (
      <div className={`h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 flex items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        Nenhuma opção disponível
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-left text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </button>
      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </span>

      {isOpen && (
        <div className="absolute left-0 z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
          </div>
          <div
            ref={listRef}
            className="max-h-48 overflow-y-auto"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={selectedValue === option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                    selectedValue === option.value
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                      : index === highlightedIndex
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  } ${
                    index === highlightedIndex
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;

