import React, { useState, useEffect } from 'react';
import api from './api';

const Sidebar = ({ onSelectSubject, selectedSubjectId, homeworks }) => {
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



    // Получить статистику по предмету
    const getSubjectStats = (subjectId) => {
    // Все невыполненные задания по предмету
    const active = homeworks.filter(h => h.subjectId === subjectId && !h.isDone);

    if (active.length === 0) {
        return { count: 0, daysLeft: null, dayOfWeek: null };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Разделяем на будущие и просроченные
    const future = active.filter(h => {
        const due = new Date(h.dueDate);
        due.setHours(0, 0, 0, 0);
        return due >= today;
    });

    const overdue = active.filter(h => {
        const due = new Date(h.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    });

    const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

    // Если есть будущие — показываем ближайшую из них
    if (future.length > 0) {
        const nearest = future.reduce((min, h) => {
            return new Date(h.dueDate) < new Date(min.dueDate) ? h : min;
        });

        const due = new Date(nearest.dueDate);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
        const dayOfWeek = days[due.getDay()];

        return {
            count: active.length,
            daysLeft: diffDays,
            dayOfWeek: dayOfWeek,
        };
    }

    // Если будущих нет — показываем, что всё просрочено
    return {
        count: active.length,
        daysLeft: -1,
        dayOfWeek: null,
        isOverdue: true,
    };
};

    return (
        <div style={{
            width: '240px',
            borderRight: '1px solid #ddd',
            padding: '10px',
            minHeight: '100vh',
            background: '#fafafa',
        }}>
            <h4>Предметы</h4>

            <div style={{ marginBottom: '15px' }}>
                <input
                    placeholder="Новый предмет"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%', padding: '6px', marginBottom: '5px', boxSizing: 'border-box' }}
                />
                <button onClick={addSubject} style={{ width: '100%', padding: '6px' }}>
                    Добавить
                </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li
                    onClick={() => onSelectSubject(null)}
                    style={{
                        padding: '8px',
                        cursor: 'pointer',
                        background: selectedSubjectId === null ? '#e3f2fd' : 'transparent',
                        borderRadius: '5px',
                        marginBottom: '3px',
                    }}
                >
                    Все предметы
                </li>

                {subjects.map(s => {
                    const stats = getSubjectStats(s.id);
                    return (
                        <li
                            key={s.id}
                            onClick={() => onSelectSubject(s.id)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                background: selectedSubjectId === s.id ? '#e3f2fd' : 'transparent',
                                borderRadius: '5px',
                                marginBottom: '3px',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{s.name}</span>
                                {stats.count > 0 && (
                                    <span style={{
                                        background: '#ff9800',
                                        color: 'white',
                                        borderRadius: '10px',
                                        padding: '1px 7px',
                                        fontSize: '11px',
                                    }}>
                                        {stats.count}
                                    </span>
                                )}
                            </div>

                            {stats.daysLeft !== null && (
    <div style={{
        fontSize: '11px',
        color: stats.daysLeft <= 1 ? '#d32f2f' : '#666',
        marginTop: '3px',
    }}>
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
        </div>
    );
};

export default Sidebar;