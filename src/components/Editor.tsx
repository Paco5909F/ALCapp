'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Trash2, Calendar, User, Settings, DollarSign, MapPin, Minus, LogOut, Sun, Moon } from 'lucide-react';
import { BudgetData, TechnicalRequirements } from '@/types';
import { Combobox } from './ui/Combobox';

const EVENT_TYPES = [
    '15 AÑOS',
    'BODA / CASAMIENTO',
    'CUMPLEAÑOS',
    'EGRESADOS / GRADUACIÓN',
    'ANIVERSARIO',
    'BAUTISMO',
    'COMUNIÓN',
    'BABY SHOWER',
    'EVENTO CORPORATIVO',
    'CONFERENCIA / ACTO',
    'EVENTO PRIVADO',
    'OTRO'
];

const LOCATIONS = [
    "CENTRO DE JUBILADOS Y PENSIONADOS DE O'HIGGINS",
    'CLUB DEFENSORES',
    'CLUB JUAN BAUTISTA ALBERDI',
    "CLUB O'HIGGINS",
    'CUARTEL DE BOMBEROS VOLUNTARIOS',
    "DELEGACIÓN MUNICIPAL O'HIGGINS",
    'MARIÁPOLIS LÍA',
    'PARROQUIA SAN JOSÉ',
    'PLAZA SAN MARTÍN',
    "PLAZOLETA O'HIGGINS"
];

interface EditorProps {
    data: BudgetData;
    onChange: (data: BudgetData) => void;
    onLogout?: () => void;
}

type RequirementNumberKey = 'parlantes' | 'potencia' | 'retornos' | 'micCable' | 'micWireless';
const REQUIREMENT_NUMBER_KEYS: Array<{ label: string; key: RequirementNumberKey }> = [
    { label: 'Parlantes', key: 'parlantes' },
    { label: 'Potencias', key: 'potencia' },
    { label: 'Retornos', key: 'retornos' },
    { label: 'Mic. Cable', key: 'micCable' },
    { label: 'Mic. Inal.', key: 'micWireless' },
];

const DEFAULT_REQUIREMENTS: TechnicalRequirements = {
    parlantes: 0,
    potencia: 0,
    retornos: 0,
    micCable: 0,
    micWireless: 0,
    iluminacion: 'ninguna',
    consola: 'ninguna',
    karaoke: false,
};

// Internal Stepper Component for improved mobile UX
const Stepper = ({ value, onChange, min = 0 }: { value: number, onChange: (val: number) => void, min?: number }) => {
    const handleIncrement = () => onChange(value + 1);
    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (isNaN(val)) onChange(0); // Optional: handle empty as 0
        else onChange(val);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="flex items-center glass-input rounded-xl overflow-hidden shrink-0">
            <button
                onClick={handleDecrement}
                className="p-1.5 hover:bg-[var(--card-bg)] active:bg-white/10 text-[var(--text-muted)] transition-colors"
                type="button"
            >
                <Minus size={12} />
            </button>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                className="w-8 bg-transparent text-center font-black outline-none text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                onClick={handleIncrement}
                className="p-1.5 hover:bg-[var(--card-bg)] active:bg-white/10 text-[var(--text-muted)] transition-colors"
                type="button"
            >
                <Plus size={12} />
            </button>
        </div>
    );
};

export default function Editor({ data, onChange, onLogout }: EditorProps) {
    const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'light') document.documentElement.classList.add('light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') document.documentElement.classList.add('light');
        else document.documentElement.classList.remove('light');
    };
    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Automatic Uppercase for specific fields
        const shouldUpperCase = ['name', 'eventType', 'eventTime', 'eventEndTime'].includes(name);

        onChange({
            ...data,
            client: {
                ...data.client,
                [name]: shouldUpperCase ? value.toUpperCase() : value,
            },
        });
    };

    const handleRequirementChange = (field: keyof typeof data.requirements, value: number | boolean | string) => {
        onChange({
            ...data,
            requirements: {
                ...data.requirements,
                [field]: value,
            },
        });
    };



    const addLogisticsItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            location: '',
            details: '',
            requirements: {
                parlantes: 0,
                potencia: 0,
                retornos: 0,
                micCable: 0,
                micWireless: 0,
                iluminacion: 'ninguna',
                consola: 'ninguna',
                karaoke: false
            }
        };
        onChange({
            ...data,
            logistics: [...(data.logistics || []), newItem],
        });
    };

    const updateLogisticsItem = (id: string, field: string, value: string | number | boolean) => {
        onChange({
            ...data,
            logistics: (data.logistics || []).map((item) => {
                if (item.id !== id) return item;

                // Handle nested requirement updates
                if (field.startsWith('req.')) {
                    const reqField = field.split('.')[1] as keyof TechnicalRequirements;
                    return {
                        ...item,
                        requirements: {
                            ...(item.requirements || DEFAULT_REQUIREMENTS),
                            [reqField]: value as never
                        }
                    };
                }

                return { ...item, [field]: value };
            }),
        });
    };

    const removeLogisticsItem = (id: string) => {
        onChange({
            ...data,
            logistics: (data.logistics || []).filter((item) => item.id !== id),
        });
    };

    return (
        <div className="flex flex-col h-full glass-panel p-3 sm:p-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--accent-blue)]/20">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[var(--border)]">
                <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden shadow-lg border border-[var(--border)]">
                    <Image
                        src="/images/logo.png"
                        alt="ALC Logo"
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase truncate">Generador de Cotizaciones</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 bg-[var(--card-bg)] hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-500 rounded-xl border border-[var(--border)] transition-all active:scale-95"
                        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="p-2.5 bg-[var(--card-bg)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 rounded-xl border border-[var(--border)] transition-all active:scale-95"
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Client Section */}
            <section className="mb-8 space-y-6">
                <div className="flex items-center gap-2 text-[var(--accent-blue)] mb-4">
                    <User size={18} />
                    <h3 className="text-lg font-semibold uppercase tracking-wider">Datos del Cliente</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <div className="glass-card p-4 rounded-2xl hover:border-blue-500/40 transition-colors group">
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase group-hover:text-blue-400 transition-colors">Nombre / Razón Social</label>
                        <input
                            type="text"
                            name="name"
                            value={data.client.name}
                            onChange={handleClientChange}
                            className="w-full bg-transparent border-b border-[var(--border)] focus:border-blue-500 outline-none transition-all py-2 text-lg font-medium placeholder:text-[var(--text-muted)]/30"
                            placeholder="EJ: JUAN PÉREZ"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="glass-card p-3 rounded-2xl">
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Fecha de Emisión</label>
                            <input
                                type="date"
                                name="emissionDate"
                                value={data.client.emissionDate || ''}
                                onChange={handleClientChange}
                                className="w-full bg-transparent outline-none opacity-80 focus:opacity-100 transition-opacity"
                            />
                        </div>

                        <div className="glass-card p-3 rounded-2xl">
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Validez</label>
                            <select
                                name="validityDays"
                                value={data.client.validityDays || 15}
                                onChange={(e) => onChange({
                                    ...data,
                                    client: {
                                        ...data.client,
                                        validityDays: Number(e.target.value),
                                    },
                                })}
                                className="w-full bg-transparent outline-none cursor-pointer appearance-none text-base"
                            >
                                <option value={15} className="bg-[var(--dropdown-bg)]">15 días</option>
                                <option value={7} className="bg-[var(--dropdown-bg)]">7 días</option>
                            </select>
                        </div>
                    </div>

                    <div className="glass-panel p-3 sm:p-5 rounded-2xl sm:rounded-3xl">
                        <div className="flex items-center gap-2 mb-4 text-[var(--accent-blue)]">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase">Detalles del Evento</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Fecha</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={data.client.date}
                                    onChange={handleClientChange}
                                    className="w-full glass-input rounded-2xl py-3 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-base"
                                />
                            </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Tipo</label>
                                        <Combobox
                                            options={EVENT_TYPES}
                                            value={data.client.eventType || ''}
                                            onChange={(val) => onChange({
                                                ...data,
                                                client: {
                                                    ...data.client,
                                                    eventType: val.toUpperCase(),
                                                },
                                            })}
                                            placeholder="SELECCIONAR TIPO..."
                                        />
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Horario Inicio</label>
                                            <div className="relative group">
                                                <input
                                                    type="time"
                                                    name="eventTime"
                                                    value={data.client.eventTime || ''}
                                                    onChange={handleClientChange}
                                                    className="w-full glass-input rounded-2xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-base"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-widest ml-1">Horario Fin</label>
                                            <div className="relative group">
                                                <input
                                                    type="time"
                                                    name="eventEndTime"
                                                    value={data.client.eventEndTime || ''}
                                                    onChange={handleClientChange}
                                                    className="w-full glass-input rounded-2xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-base"
                                                />
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Requirements Section (Hidden if Logistics exist) */}
            {(!data.logistics || data.logistics.length === 0) && (
                <section className="mb-8 space-y-4">
                    <div className="flex items-center gap-2 text-[var(--accent-purple)] mb-4">
                        <Settings size={18} />
                        <h3 className="text-lg font-semibold uppercase tracking-wider">Técnica</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {REQUIREMENT_NUMBER_KEYS.map((req) => (
                        <div key={req.key} className="glass-card p-4 rounded-2xl flex flex-col justify-center items-center gap-2 shadow-sm hover:border-purple-500/40 transition-colors">
                                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center">{req.label}</label>
                                <Stepper
                                    value={data.requirements[req.key] || 0}
                                    onChange={(val) => handleRequirementChange(req.key, val)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="glass-card p-3 rounded-2xl">
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest ml-1">Iluminación</label>
                            <select
                                value={data.requirements.iluminacion}
                                onChange={(e) => handleRequirementChange('iluminacion', e.target.value)}
                                className="w-full bg-transparent p-2 rounded-xl border border-[var(--border)] outline-none text-base appearance-none"
                            >
                                <option value="ninguna" className="bg-[var(--dropdown-bg)]">Ninguna</option>
                                <option value="basica" className="bg-[var(--dropdown-bg)]">Básica</option>
                                <option value="media" className="bg-[var(--dropdown-bg)]">Media</option>
                                <option value="completa" className="bg-[var(--dropdown-bg)]">Completa</option>
                                <option value="torre_chica" className="bg-[var(--dropdown-bg)]">Torre Chica</option>
                                <option value="torre_media" className="bg-[var(--dropdown-bg)]">Torre Media</option>
                                <option value="estruct_grande" className="bg-[var(--dropdown-bg)]">Estructura Grande</option>
                            </select>
                        </div>

                        <div className="glass-card p-3 rounded-2xl">
                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest ml-1">Consola</label>
                            <select
                                value={data.requirements.consola}
                                onChange={(e) => handleRequirementChange('consola', e.target.value)}
                                className="w-full bg-transparent p-2 rounded-xl border border-[var(--border)] outline-none text-base appearance-none"
                            >
                                <option value="ninguna" className="bg-[var(--dropdown-bg)]">Ninguna</option>
                                <option value="8ch" className="bg-[var(--dropdown-bg)]">8 Canales</option>
                                <option value="12ch" className="bg-[var(--dropdown-bg)]">12 Canales</option>
                                <option value="32ch" className="bg-[var(--dropdown-bg)]">32 Canales</option>
                            </select>
                        </div>

                        <div className="glass-card p-3 rounded-2xl flex flex-col justify-center">
                            <label className="flex items-center gap-3 cursor-pointer hover:text-purple-400 transition w-full h-full group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={data.requirements?.karaoke || false}
                                        onChange={(e) => handleRequirementChange('karaoke', e.target.checked)}
                                        className="accent-purple-500 w-5 h-5 rounded-lg"
                                    />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Karaoke</span>
                            </label>
                        </div>
                    </div>
                </section>
            )}

            {/* Logistics Section */}
            <section className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 text-[var(--accent-orange)]">
                    <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                        <MapPin size={16} className="shrink-0" />
                        <h3 className="text-sm sm:text-lg font-semibold uppercase tracking-wider truncate">Logística / Ubicaciones</h3>
                    </div>
                    <button
                        onClick={addLogisticsItem}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl transition-all shadow-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider btn-premium w-full sm:w-auto shrink-0"
                    >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                        <span className="whitespace-nowrap">Agregar Ubicación</span>
                    </button>
                </div>

                <div className="space-y-3">
                    {(!data.logistics || data.logistics.length === 0) ? (
                        <div className="text-[var(--text-muted)] text-center py-6 border border-dashed border-[var(--border)] rounded-2xl glass-card">
                            <p className="text-xs">No hay ubicaciones agregadas.</p>
                        </div>
                    ) : (
                        data.logistics.map((item) => (
                            <div key={item.id} className="relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl glass-card group hover:border-blue-500/40 transition-all overflow-hidden">
                                <button
                                    onClick={() => removeLogisticsItem(item.id)}
                                    className="absolute top-2 right-2 bg-[var(--dropdown-bg)] text-[var(--text-muted)] hover:bg-red-500 hover:text-white transition-all p-1.5 rounded-lg border border-[var(--border)] shadow-xl z-10 active:scale-90"
                                    title="Eliminar ubicación"
                                >
                                    <Trash2 size={14} />
                                </button>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase">Lugar / Ubicación</label>
                                            <Combobox
                                                options={LOCATIONS}
                                                value={item.location}
                                                onChange={(val) => updateLogisticsItem(item.id, 'location', val)}
                                                placeholder="Ej: Cuartel de Bomberos"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase">Observaciones / Detalle Adicional</label>
                                            <input
                                                type="text"
                                                value={item.details}
                                                onChange={(e) => updateLogisticsItem(item.id, 'details', e.target.value)}
                                                className="w-full glass-input rounded-2xl py-3 px-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-[var(--text-muted)]/50 text-base"
                                                placeholder="Notas adicionales..."
                                            />
                                        </div>
                                    </div>

                                    {/* Per-Location Requirements */}
                                    <div className="bg-[var(--background)]/50 p-4 rounded-2xl border border-[var(--border)]">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                            {REQUIREMENT_NUMBER_KEYS.map((req) => (
                                                <div key={req.key} className="glass-card p-2 rounded-xl flex flex-col justify-center items-center gap-1 border border-[var(--border)]">
                                                    <label className="text-[10px] font-medium text-[var(--text-muted)] truncate w-full text-center">{req.label}</label>
                                                    <Stepper
                                                        value={item.requirements?.[req.key] || 0}
                                                        onChange={(val) => updateLogisticsItem(item.id, `req.${req.key}`, val)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <select
                                                value={item.requirements?.iluminacion || 'ninguna'}
                                                onChange={(e) => updateLogisticsItem(item.id, 'req.iluminacion', e.target.value)}
                                                className="bg-[var(--dropdown-bg)] border border-[var(--border)] rounded-xl text-[10px] p-2 outline-none font-bold uppercase tracking-wider"
                                            >
                                                <option value="ninguna">Ilum: Ninguna</option>
                                                <option value="basica">Ilum: Básica</option>
                                                <option value="media">Ilum: Media</option>
                                                <option value="completa">Ilum: Completa</option>
                                                <option value="torre_chica">Ilum: Torre Chica</option>
                                                <option value="torre_media">Ilum: Torre Media</option>
                                                <option value="estruct_grande">Ilum: Estructura Grande</option>
                                            </select>

                                            <select
                                                value={item.requirements?.consola || 'ninguna'}
                                                onChange={(e) => updateLogisticsItem(item.id, 'req.consola', e.target.value)}
                                                className="bg-[var(--dropdown-bg)] border border-[var(--border)] rounded-xl text-[10px] p-2 outline-none font-bold uppercase tracking-wider"
                                            >
                                                <option value="ninguna">Consola: Ninguna</option>
                                                <option value="8ch">Consola: 8 Canales</option>
                                                <option value="12ch">Consola: 12 Canales</option>
                                                <option value="32ch">Consola: 32 Canales</option>
                                            </select>

                                            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition glass-card rounded-xl p-2 justify-center border border-[var(--border)]">
                                                <input
                                                    type="checkbox"
                                                    checked={item.requirements?.karaoke || false}
                                                    onChange={(e) => updateLogisticsItem(item.id, 'req.karaoke', e.target.checked)}
                                                    className="accent-blue-500 w-3 h-3"
                                                />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Karaoke</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Finalization Section */}
            <section className="mb-8 space-y-4">

                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                    <div className="glass-card p-5 rounded-2xl border border-[var(--border)] shadow-xl shadow-green-500/5">
                        <label className="block text-xs font-bold text-green-500 mb-2 uppercase tracking-wide">Total Personalizado (Opcional)</label>
                        <p className="text-[10px] text-[var(--text-muted)] mb-4 font-medium opacity-60">Si se deja vacío, se calcula automáticamente.</p>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={24} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={data.customTotal !== undefined ? new Intl.NumberFormat('es-AR').format(data.customTotal) : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\./g, '');
                                    const val = raw === '' ? undefined : Number(raw);
                                    if (raw === '' || !isNaN(Number(raw))) {
                                        onChange({ ...data, customTotal: val });
                                    }
                                }}
                                className="w-full glass-input rounded-2xl p-4 pl-14 text-2xl font-black outline-none transition-all placeholder:text-[var(--text-muted)]/20"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                    <div className="glass-card p-4 rounded-2xl border border-[var(--border)]">
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest ml-1">Observaciones / Condiciones</label>
                        <textarea
                            name="conditions"
                            value={data.client.conditions}
                            onChange={handleClientChange}
                            rows={3}
                            className="w-full bg-transparent p-4 rounded-xl border border-[var(--border)] focus:border-blue-500 outline-none transition resize-none text-base font-medium placeholder:text-[var(--text-muted)]/30"
                            placeholder="Forma de pago, horarios, requerimientos..."
                        />
                    </div>
                </div>
            </section >

            <div className="pt-12 pb-6 text-center opacity-40">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">
                    Sistema desarrollado por Joaquín Rosas
                </p>
            </div>
        </div >
    );
}
