import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar...",
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on input, but always show all if filter is empty or matches value exactly
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync internal filter with external value when it changes externally
    useEffect(() => {
        setFilter(value);
    }, [value]);

    const handleSelect = (option: string) => {
        onChange(option);
        setFilter(option);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFilter(newValue);
        onChange(newValue);
        setIsOpen(true);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    className="w-full glass-input rounded-2xl py-4 px-6 pr-12 font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-500/50 uppercase"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (isOpen) {
                            setIsOpen(false);
                        } else {
                            setIsOpen(true);
                            inputRef.current?.focus();
                        }
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                >
                    <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[var(--dropdown-bg)] border border-[var(--border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-60 overflow-y-auto scrollbar-none animate-in fade-in zoom-in-95 duration-200">
                    {filteredOptions.length > 0 ? (
                        <div className="p-2 space-y-1">
                            {filteredOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-500 hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-white rounded-xl transition flex items-center justify-between group/item uppercase tracking-widest"
                                >
                                    {option}
                                    {value === option && <Check size={16} className="text-blue-400" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-5 py-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic text-center">
                            Sin coincidencias
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
