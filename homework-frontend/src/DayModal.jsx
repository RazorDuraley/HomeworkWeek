import React, { useState, useEffect } from 'react';
import api from './api';

const DayModal = ({ day, homeworks, onClose, onUpdate }) => {
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState('');
    const [task, setTask] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        api.get('/api/subjects')
            .then(res => setSubjects(res.data))
            .catch(err => console.error(err));
    }, []);

    const addHomework = () => {
        if (!subjectId || !task) {
            alert('Выбери предмет и введи задание');
            return;
        }

        api.post('/api/homework', {
            subjectId: parseInt(subjectId),
            task,
            dueDate: day.toISOString(),
            comment,
        })
            .then(() => {
                setSubjectId('');
                setTask('');
                setComment('');
                onUpdate();
            })
            .catch(err => console.error(err));
    };

    const toggleDone = (id) => {
        api.put(`/api/homework/${id}/done`)
            .then(() => onUpdate())
            .catch(err => console.error(err));
    };

    const deleteHomework = (id) => {
        api.delete(`/api/homework/${id}`)
            .then(() => onUpdate())
            .catch(err => console.error(err));
    };

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
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
            }}>
                <button onClick={onClose} style={{ float: 'right' }}>✕</button>
                <h3>{day.toLocaleDateString('ru-RU')}</h3>

                <div style={{ marginTop: '20px' }}>
                    <h4>Задания:</h4>
                    {homeworks.length === 0 ? (
                        <p>Нет заданий</p>
                    ) : (
                        homeworks.map(h => (
                            <div key={h.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px',
                                border: '1px solid #eee',
                                borderRadius: '5px',
                                marginBottom: '5px',
                                background: h.isDone ? '#e8f5e9' : 'white',
                            }}>
                                <div>
                                    <strong>{h.subject?.name}</strong>: {h.task}
                                    {h.comment && <div style={{ fontSize: '12px', color: '#666' }}>{h.comment}</div>}
                                </div>
                                <div>
                                    <button onClick={() => toggleDone(h.id)}>
                                        {h.isDone ? '↺' : '✓'}
                                    </button>
                                    <button onClick={() => deleteHomework(h.id)}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4>Добавить задание:</h4>

                    <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '8px' }}
                    >
                        <option value="">Выбери предмет</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <input
                        placeholder="Что задали"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '8px' }}
                    />
                    <input
                        placeholder="Комментарий (необязательно)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '8px' }}
                    />
                    <button onClick={addHomework} style={{ padding: '10px 20px' }}>
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayModal;