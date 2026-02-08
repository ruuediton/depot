
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import InternetErrorModal from '../components/InternetErrorModal';

interface NetworkContextType {
    runWithTimeout: <T>(fn: () => Promise<T>) => Promise<T>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);
    const [cancelCallback, setCancelCallback] = useState<(() => void) | null>(null);

    /**
     * Executes a promise-returning function with a 15-second timeout.
     * If the timeout is reached, it displays the InternetErrorModal.
     * User can retry (re-runs the function) or close (rejects the promise).
     */
    const runWithTimeout = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            let isComplete = false;

            const timeoutId = setTimeout(() => {
                if (isComplete) return;

                // Timeout Triggered

                // Define Retry Action
                setRetryCallback(() => () => {
                    // Recursively try again
                    runWithTimeout(fn)
                        .then(resolve)
                        .catch(reject);
                });

                // Define Cancel Action
                setCancelCallback(() => () => {
                    reject(new Error("A operação falhou devido ao tempo limite de conexão."));
                });

                setIsModalOpen(true);
            }, 15000); // 15 seconds

            // Execute the function
            fn()
                .then((res) => {
                    if (isComplete) return;
                    isComplete = true;
                    clearTimeout(timeoutId);
                    resolve(res);
                })
                .catch((err) => {
                    if (isComplete) return;
                    isComplete = true;
                    clearTimeout(timeoutId);
                    reject(err);
                });
        });
    }, []);

    const handleRetry = () => {
        setIsModalOpen(false);
        if (retryCallback) retryCallback();
    };

    const handleClose = () => {
        setIsModalOpen(false);
        if (cancelCallback) cancelCallback();
    };

    return (
        <NetworkContext.Provider value={{ runWithTimeout }}>
            {children}
            <InternetErrorModal
                isOpen={isModalOpen}
                onRetry={handleRetry}
                onClose={handleClose}
            />
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};

