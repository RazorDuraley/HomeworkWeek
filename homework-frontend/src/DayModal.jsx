import React, { useState, useEffect } from 'react';
import api from './api';
import { useAuth } from './AuthContext';

const DayModal = ({ day, homeworks, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [task, setTask] = useState('');
    const [comment, setComment] = useState('');
    const [useSchedule, setUseSchedule] = useState(false);
    const [schedule, setSchedule] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [isShared, setIsShared] = useState(false);
    
    useEffect(() => {
        api.get('/api/subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!day) return;
        setScheduleLoading(true);
        const dateStr = day.toISOString().split('T')[0];
        api.get(`/api/schedule/week?date=${dateStr}`)
            .then(res => {
                // фильтруем только пары этого дня недели
                const dayOfWeek = day.getDay() === 0 ? 7 : day.getDay(); // 1=Пн..7=Вс
                const entries = (res.data.entries || []).filter(
                    e => e.dayOfWeek === dayOfWeek
                );
                setSchedule(entries);
            })
            .catch(err => console.error('Schedule load error:', err))
            .finally(() => setScheduleLoading(false));
    }, [day]);

    const addHomework = () => {
        if (!subjectId || !task) {
            alert('Выбери предмет и введи задание');
            return;
        }

        const payload = {
    subjectId: parseInt(subjectId),
    task,
    comment,
    useSchedule,
    isShared,
};

        if (!useSchedule) {
            payload.dueDate = day.toISOString();
        }

        api.post('/api/homework', payload)
            .then(() => {
                setSubjectId('');
                setTask('');
                setComment('');
                setUseSchedule(false);
                onUpdate();
            })
            .catch(err => {
                console.error(err);
                alert(err.response?.data || 'Не удалось добавить задание');
            });
    };

    const toggleDone = (id) => {
        api.put(`/api/homework/${id}/done`)
            .then(() => onUpdate())
            .catch(err => console.error(err));
    };

    const deleteHomework = (id) => {
        if (!confirm('Удалить задание?')) return;
        api.delete(`/api/homework/${id}`)
            .then(() => onUpdate())
            .catch(err => {
                if (err.response?.status === 403) {
                    alert('Ты можешь удалять только свои задания');
                } else {
                    console.error(err);
                }
            });
    };

    // Определяем цвет домашки
    const getHomeworkColor = (h) => {
        if (h.isDone) return '#c8e6c9';                       // выполнено — зелёный
        if (h.createdByUserId && h.createdByUserId === user?.id) return '#e3f2fd'; // своё — синий
        return '#fff3e0';                                     // чужое/общее — оранжевый
    };
    // Предметы, которые есть в расписании на этот день
const availableSubjects = (() => {
    if (schedule.length === 0) return subjects;  // fallback: если пар нет — все предметы

    const ids = new Set(schedule.map(e => e.subjectId));
    return subjects.filter(s => ids.has(s.id));
})();
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '520px',
                width: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
            }}>
                <button onClick={onClose} style={{ float: 'right', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text)' }}>✕</button>
                <h3 style={{ marginTop: 0 }}>{day.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>

                {/* ===== Пары этого дня ===== */}
                <div style={{ marginTop: '16px' }}>
                    <h4>🎓 Пары:</h4>
                    {scheduleLoading ? (
                        <p style={{ color: 'var(--text)', fontSize: '13px' }}>Загрузка...</p>
                    ) : schedule.length === 0 ? (
                        <p style={{ color: 'var(--text)', fontSize: '13px' }}>Нет пар</p>
                    ) : (
                        schedule
                            .sort((a, b) => a.pairNumber - b.pairNumber)
                            .map(e => (
                                <div key={e.id} style={{
                                    padding: '8px 10px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                    background: 'var(--accent-bg)',
                                    fontSize: '13px',
                                }}>
                                    <div style={{ fontWeight: 600 }}>
                                        {e.pairNumber}. {e.subjectName}
                                        <span style={{ color: 'var(--text)', fontWeight: 400, marginLeft: '6px' }}>
                                            {e.startTime}–{e.endTime}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                                        {e.lessonType}{e.room ? ` · ${e.room}` : ''}
                                    </div>
                                    {e.teacher && (
                                        <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>
                                            👤 {e.teacher}
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>

                {/* ===== Домашки ===== */}
                <div style={{ marginTop: '20px' }}>
                    <h4>📝 Задания:</h4>
                    {homeworks.length === 0 ? (
                        <p style={{ color: 'var(--text)', fontSize: '13px' }}>Нет заданий</p>
                    ) : (
                        homeworks.map(h => {
                            const isMine = h.createdByUserId && h.createdByUserId === user?.id;
                            return (
                                <div key={h.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                    background: getHomeworkColor(h),
                                    color: '#222',
                                    gap: '8px',
                                }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div>
                                            <strong>{h.subject?.name}</strong>: {h.task}
                                        </div>
                                        {h.comment && (
                                            <div style={{ fontSize: '12px', color: '#555' }}>{h.comment}</div>
                                        )}
                                        {!isMine && h.createdByName && (
                                            <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>
                                                👤 {h.createdByName}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => toggleDone(h.id)} title="Отметить">
                                            {h.isDone ? '↺' : '✓'}
                                        </button>
                                        <button onClick={() => deleteHomework(h.id)} title="Удалить">🗑️</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ===== Добавить ===== */}
                <div style={{ marginTop: '20px' }}>
                    <h4>➕ Добавить задание:</h4>

                        <select
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        style={{ width: '100%', marginBottom: '5px', padding: '8px' }}
    >
        <option value="">Выбери предмет</option>
        {availableSubjects.map(s => (
            <option key={s.id} value={s.id}>
                {s.name}{s.teacher ? ` — ${s.teacher.split(',')[0]}` : ''}
            </option>
        ))}
    </select>

                    <input
                        placeholder="Что задали"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '8px', boxSizing: 'border-box' }}
                    />
                    <input
                        placeholder="Комментарий (необязательно)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '8px', boxSizing: 'border-box' }}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '8px', color: 'var(--text)' }}>
                    <input
                        type="checkbox"
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                    />
                    Общая домашка (видят все)
                </label>

                    <button onClick={addHomework} style={{ padding: '10px 20px' }}>
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayModal;