import React, { useState } from 'react';

const SubjectModal = ({ subject, onSave, onClose }) => {
    const [name, setName] = useState(subject.name);
    const [teacher, setTeacher] = useState(subject.teacher || '');

    const handleSave = () => {
        if (!name.trim()) {
            alert('Название не может быть пустым');
            return;
        }
        onSave(subject.id, name.trim(), teacher.trim() || null);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    padding: '20px',
                    borderRadius: '10px',
                    maxWidth: '400px',
                    width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0 }}>Редактировать предмет</h3>

                <input
                    placeholder="Название"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                />
                <input
                    placeholder="Преподаватель (необязательно)"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px' }}>Отмена</button>
                    <button onClick={handleSave} style={{ padding: '8px 16px' }}>Сохранить</button>
                </div>
            </div>
        </div>
    );
};

export default SubjectModal;