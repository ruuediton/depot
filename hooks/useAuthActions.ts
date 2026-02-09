import { useCallback } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';

export const useAuthActions = () => {
    const { showLoading, hideLoading, showWarning } = useLoading();

    const performFullLogout = useCallback(async () => {
        try {
            showLoading();

            // 1. Sign out from Supabase
            await supabase.auth.signOut();

            // 2. Clear storages
            localStorage.clear();
            sessionStorage.clear();

            // 3. Clear Cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }

            // 4. Force reload to clear memory and network session
            window.location.href = window.location.origin + window.location.pathname + '#/login';

        } catch (error) {
            console.error("Logout error");
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading]);

    return { performFullLogout };
};
