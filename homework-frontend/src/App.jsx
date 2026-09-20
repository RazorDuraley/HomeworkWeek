import React, { useState, useEffect } from 'react';
import api from './api';
import Calendar from './Calendar';
import Sidebar from './Sidebar';
import LoginPage from './LoginPage';
import { useAuth } from './AuthContext';

function App() {
    const { user, loading: authLoading, logout } = useAuth();
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const loadHomeworks = () => {
        setLoading(true);
        api.get('/api/homework')
            .then(res => setHomeworks(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error('Ошибка загрузки:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (user) loadHomeworks();
    }, [user]);

    // Пока проверяется токен — показываем заглушку
    if (authLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    // Не залогинен — экран логина
    if (!user) {
        return <LoginPage />;
    }

    const handleSelectSubject = (id) => {
        setSelectedSubjectId(id);
        setSidebarOpen(false);
    };

    return (
        <div className="app">
            <header className="topbar">
                <button
                    className="burger"
                    onClick={() => setSidebarOpen(v => !v)}
                    aria-label="Меню"
                >
                    ☰
                </button>
                <span className="topbar-title">📚 Домашка</span>
                <div className="topbar-user">
                    <span className="topbar-username">
                        {user.displayName || user.email}
                    </span>
                    <button className="logout-btn" onClick={logout}>
                        Выйти
                    </button>
                </div>
            </header>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="layout">
                <Sidebar
                    selectedSubjectId={selectedSubjectId}
                    onSelectSubject={handleSelectSubject}
                    homeworks={homeworks}
                    isOpen={sidebarOpen}
                />
                <main className="content">
                    {loading ? (
                        <div className="loading">Загрузка...</div>
                    ) : (
                        <Calendar
                            selectedSubjectId={selectedSubjectId}
                            homeworks={homeworks}
                            onUpdate={loadHomeworks}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;