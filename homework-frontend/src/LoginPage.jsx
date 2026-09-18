import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginPage = () => {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, displayName);
            }
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data
                || 'Не удалось войти';
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={submit}>
                <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>

                {mode === 'register' && (
                    <input
                        placeholder="Имя (необязательно)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="login-input"
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="login-input"
                />

                {error && <div className="login-error">{error}</div>}

                <button type="submit" disabled={loading} className="login-button">
                    {loading ? '...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                </button>

                <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="login-switch"
                >
                    {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;