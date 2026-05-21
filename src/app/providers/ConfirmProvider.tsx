import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';

type ConfirmOptions = {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'default';
};

type ConfirmState = ConfirmOptions & {
    resolve: (value: boolean) => void;
};

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ConfirmState | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setState({
                ...options,
                resolve,
            });
        });
    }, []);

    const closeWith = useCallback((value: boolean) => {
        setState((current) => {
            if (current) {
                current.resolve(value);
            }
            return null;
        });
    }, []);

    const contextValue = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={contextValue}>
            {children}

            <Modal isOpen={!!state} onClose={() => closeWith(false)} title={state?.title ?? ''}>
                <div className="space-y-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {state?.description}
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => closeWith(false)}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            {state?.cancelLabel ?? 'Cancel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => closeWith(true)}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${state?.tone === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {state?.confirmLabel ?? 'Confirm'}
                        </button>
                    </div>
                </div>
            </Modal>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};