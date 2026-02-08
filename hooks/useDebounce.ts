import { useCallback, useRef } from 'react';

/**
 * Hook para prevenir duplo clique e otimizar performance
 * Bloqueia execuções múltiplas de uma função dentro de um intervalo de tempo
 */
export function useDebounceClick<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 300
): T {
    const isProcessing = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
        ((...args: Parameters<T>) => {
            // Se já está processando, ignora
            if (isProcessing.current) {
                return;
            }

            // Marca como processando
            isProcessing.current = true;

            // Executa o callback
            callback(...args);

            // Limpa timeout anterior se existir
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Libera após o delay
            timeoutRef.current = setTimeout(() => {
                isProcessing.current = false;
            }, delay);
        }) as T,
        [callback, delay]
    );
}

/**
 * Hook para debounce de valores (útil para inputs)
 */
export function useDebounceValue<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
