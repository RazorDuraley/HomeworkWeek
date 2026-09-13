import React, { useState, useEffect } from 'react';
import api from './api';
import Calendar from './Calendar';
import Sidebar from './Sidebar';

function App() {
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
        loadHomeworks();
    }, []);

    const handleSelectSubject = (id) => {
        setSelectedSubjectId(id);
        setSidebarOpen(false); // на телефоне закрываем меню после выбора
    };

    return (
        <div className="app">
            {/* Верхняя панель на мобилке */}
            <header className="topbar">
                <button
                    className="burger"
                    onClick={() => setSidebarOpen(v => !v)}
                    aria-label="Меню"
                >
                    ☰
                </button>
                <span className="topbar-title">Домашка ИВ-623</span>
            </header>

            {/* Оверлей, чтобы закрыть меню тапом по фону */}
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
                    <h1 className="desktop-title">Домашка ИВ-623</h1>
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