import React, { useState, useEffect } from 'react';
import api from './api';
import SubjectModal from './SubjectModal';

const Sidebar = ({ onSelectSubject, selectedSubjectId, homeworks, isOpen }) => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [newTeacher, setNewTeacher] = useState('');
    const [editing, setEditing] = useState(null); // { id, name, teacher } | null

    const loadSubjects = () => {
        api.get('/api/subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    const addSubject = () => {
        if (!newSubject.trim()) return;

        api.post('/api/subjects', {
            name: newSubject,
            teacher: newTeacher,
        })
            .then(res => {
                setSubjects([...subjects, res.data]);
                setNewSubject('');
                setNewTeacher('');
            })
            .catch(err => {
                console.error(err);
                alert('Не удалось добавить предмет');
            });
    };

    const deleteSubject = (id, name) => {
        if (!confirm(`Удалить предмет «${name}»?`)) return;

        api.delete(`/api/subjects/${id}`)
            .then(() => {
                setSubjects(subjects.filter(s => s.id !== id));
                // Если удалили выбранный — сбрасываем выбор
                if (selectedSubjectId === id) {
                    onSelectSubject(null);
                }
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 409) {
                    alert('Нельзя удалить предмет, к которому привязаны задания. Сначала удали задания.');
                } else {
                    alert('Не удалось удалить предмет');
                }
            });
    };

    const saveEdit = (id, name, teacher) => {
        api.put(`/api/subjects/${id}`, { name, teacher })
            .then(() => {
                setSubjects(subjects.map(s =>
                    s.id === id ? { ...s, name, teacher } : s
                ));
                setEditing(null);
            })
            .catch(err => {
                console.error(err);
                alert('Не удалось сохранить изменения');
            });
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
                    placeholder="Название предмета"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                />
                <input
                    placeholder="Преподаватель (необязательно)"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
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
                            className={`sidebar-subject ${selectedSubjectId === s.id ? 'active' : ''}`}
                        >
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                                onClick={() => onSelectSubject(s.id)}
                            >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {s.name}
                                        </span>
                                        {stats.count > 0 && (
                                            <span className="sidebar-badge">{stats.count}</span>
                                        )}
                                    </div>
                                    {s.teacher && (
                                        <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>
                                            👤 {s.teacher}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                    <button
                                        className="icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditing({ id: s.id, name: s.name, teacher: s.teacher || '' });
                                        }}
                                        title="Редактировать"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSubject(s.id, s.name);
                                        }}
                                        title="Удалить"
                                    >
                                        🗑️
                                    </button>
                                </div>
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

            {editing && (
                <SubjectModal
                    subject={editing}
                    onSave={saveEdit}
                    onClose={() => setEditing(null)}
                />
            )}
        </aside>
    );
};

export default Sidebar;