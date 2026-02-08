import React, { ButtonHTMLAttributes, useCallback, useRef } from 'react';

interface OptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    debounceMs?: number;
    children: React.ReactNode;
}

/**
 * Botão otimizado que previne duplo clique automaticamente
 * Mantém todas as props e estilos do botão original
 */
const OptimizedButton = React.memo<OptimizedButtonProps>(({
    onClick,
    debounceMs = 300,
    disabled,
    children,
    ...props
}) => {
    const isProcessing = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        // Se está processando ou desabilitado, ignora
        if (isProcessing.current || disabled) {
            e.preventDefault();
            return;
        }

        // Marca como processando
        isProcessing.current = true;

        // Executa o onClick original
        onClick?.(e);

        // Limpa timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Libera após o delay
        timeoutRef.current = setTimeout(() => {
            isProcessing.current = false;
        }, debounceMs);
    }, [onClick, debounceMs, disabled]);

    return (
        <button
            {...props}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
});

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;
