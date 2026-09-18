import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // При загрузке — проверяем, что токен ещё валиден
    useEffect(() => {
        const init = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/api/auth/me');
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (e) {
                // токен протух — чистим
                logout();
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []); // eslint-disable-line

    // Слушаем событие от axios-interceptor
    useEffect(() => {
        const handler = () => logout();
        window.addEventListener('auth:logout', handler);
        return () => window.removeEventListener('auth:logout', handler);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);

        const me = await api.get('/api/auth/me');
        setUser(me.data);
        localStorage.setItem('user', JSON.stringify(me.data));
        return me.data;
    };

    const register = async (email, password, displayName) => {
        await api.post('/api/auth/register', { email, password, displayName });
        return login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.roles?.includes('Admin') ?? false;
    const isModerator = user?.roles?.includes('Moderator') ?? false;

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, register, logout,
            isAdmin, isModerator,
            canManageSubjects: isAdmin || isModerator,
        }}>
            {children}
        </AuthContext.Provider>
    );
};