import React, { useState } from 'react';
import api from './api';

const AddHomeworkModal = ({ subject, presetDueDate, onClose, onUpdate }) => {
    const [task, setTask] = useState('');
    const [comment, setComment] = useState('');
    const [isShared, setIsShared] = useState(false);
    const [error, setError] = useState(null);

    const submit = () => {
        if (!task.trim()) {
            setError('Введи задание');
            return;
        }

        const payload = {
            subjectId: subject.id,
            task: task.trim(),
            comment: comment.trim(),
            isShared,
            useSchedule: !presetDueDate,        // если дата не пришла — берём из расписания
        };

        if (presetDueDate) {
            payload.dueDate = presetDueDate;  
              }

        api.post('/api/homework', payload)
            .then(() => {
                onUpdate();
                onClose();
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data || 'Не удалось добавить');
            });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1200,
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--bg)', color: 'var(--text)',
                    padding: '20px', borderRadius: '10px',
                    maxWidth: '420px', width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0 }}>Новое задание</h3>
                <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '12px' }}>
                    Предмет: <strong>{subject.name}</strong>
                    {presetDueDate && (
                        <> · Дата: {new Date(presetDueDate + 'T00:00:00').toLocaleDateString('ru-RU')}
                        </>
                    )}
                </div>

                <input
                    placeholder="Что задали"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', boxSizing: 'border-box' }}
                />
                <input
                    placeholder="Комментарий (необязательно)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', boxSizing: 'border-box' }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '12px', color: 'var(--text)' }}>
                    <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />
                    Общая домашка (видят все)
                </label>

                {error && <div style={{ color: '#c62828', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}>
                        Отмена
                    </button>
                    <button onClick={submit} style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px' }}>
                        Добавить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddHomeworkModal;