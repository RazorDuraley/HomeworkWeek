import React, { useState, useEffect } from 'react';
import api from './api';

const Sidebar = ({ onSelectSubject, selectedSubjectId, homeworks, isOpen }) => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');

    useEffect(() => {
        api.get('/api/subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    }, []);

    const addSubject = () => {
        if (!newSubject.trim()) return;

        api.post('/api/subjects', { name: newSubject })
            .then(res => {
                setSubjects([...subjects, res.data]);
                setNewSubject('');
            })
            .catch(err => console.error(err));
    };

    const getSubjectStats = (subjectId) => {
        const active = homeworks.filter(h => h.subjectId === subjectId && !h.isDone);

        if (active.length === 0) {
            return { count: 0, daysLeft: null, dayOfWeek: null };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const future = active.filter(h => {
            const due = new Date(h.dueDate);
            due.setHours(0, 0, 0, 0);
            return due >= today;
        });

        const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

        if (future.length > 0) {
            const nearest = future.reduce((min, h) =>
                new Date(h.dueDate) < new Date(min.dueDate) ? h : min
            );
            const due = new Date(nearest.dueDate);
            due.setHours(0, 0, 0, 0);

            const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
            const dayOfWeek = days[due.getDay()];

            return { count: active.length, daysLeft: diffDays, dayOfWeek };
        }

        return { count: active.length, daysLeft: -1, dayOfWeek: null, isOverdue: true };
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <h4 className="sidebar-title">Предметы</h4>

            <div style={{ marginBottom: '15px' }}>
                <input
                    placeholder="Новый предмет"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                />
                <button onClick={addSubject} style={{ width: '100%', padding: '8px' }}>
                    Добавить
                </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li
                    onClick={() => onSelectSubject(null)}
                    className={`sidebar-subject ${selectedSubjectId === null ? 'active' : ''}`}
                >
                    Все предметы
                </li>

                {subjects.map(s => {
                    const stats = getSubjectStats(s.id);
                    return (
                        <li
                            key={s.id}
                            onClick={() => onSelectSubject(s.id)}
                            className={`sidebar-subject ${selectedSubjectId === s.id ? 'active' : ''}`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{s.name}</span>
                                {stats.count > 0 && (
                                    <span className="sidebar-badge">{stats.count}</span>
                                )}
                            </div>

                            {stats.daysLeft !== null && (
                                <div className={`sidebar-stats ${stats.daysLeft <= 1 ? 'urgent' : ''}`} style={{ width: '100%' }}>
                                    {stats.isOverdue && `просрочено (${stats.count})`}
                                    {!stats.isOverdue && stats.daysLeft === 0 && '🔥 сегодня'}
                                    {!stats.isOverdue && stats.daysLeft === 1 && '⚠️ завтра'}
                                    {!stats.isOverdue && stats.daysLeft > 1 && `через ${stats.daysLeft} дн. (${stats.dayOfWeek})`}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
};

export default Sidebar;