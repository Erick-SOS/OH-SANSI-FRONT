
import React from 'react';

interface GroupOption {
    area: string;
    nivel: string;
    modalidad: string;
    fase: string;
    count: number; // Optional: show count of students
}

interface SelectorListasEvaluadorProps {
    isOpen: boolean;
    onClose: () => void;
    groups: GroupOption[];
    selectedGroupIndex: number;
    onSelect: (index: number) => void;
}

const SelectorListasEvaluador: React.FC<SelectorListasEvaluadorProps> = ({
    isOpen,
    onClose,
    groups,
    selectedGroupIndex,
    onSelect,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transform transition-all">
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Seleccionar Lista de Evaluación
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tiene  asignadas las siguientes listas. Seleccione una para comenzar a calificar.
                    </p>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-3 sm:grid-cols-1">
                        {groups.map((group, idx) => (
                            <button
                                key={`${group.area}-${group.nivel}-${group.modalidad}-${group.fase}`}
                                onClick={() => {
                                    onSelect(idx);
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${selectedGroupIndex === idx
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-1 ring-indigo-500'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${selectedGroupIndex === idx
                                                ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {group.modalidad}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            • {group.fase}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                            {group.area}
                                        </span>
                                        <span className="hidden sm:inline text-gray-400 dark:text-gray-600">/</span>
                                        <span className="text-base font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {group.nivel}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {group.count} participantes
                                    </div>
                                </div>

                                {selectedGroupIndex === idx && (
                                    <div className="flex-shrink-0 ml-4 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectorListasEvaluador;
