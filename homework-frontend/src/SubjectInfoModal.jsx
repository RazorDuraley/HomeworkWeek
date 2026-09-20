import React, { useState, useEffect } from 'react';
import api from './api';
import AddHomeworkModal from './AddHomeworkModal';

const SubjectInfoModal = ({ subjectId, onClose, onShowOnCalendar, onUpdate }) => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        api.get(`/api/subjects/${subjectId}/info`)
            .then(res => setInfo(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [subjectId]);

    if (showAdd && info) {
        return (
            <AddHomeworkModal
                subject={info}
                presetDueDate={info.nextPairDate}
                onClose={() => setShowAdd(false)}
                onUpdate={onUpdate}
            />
        );
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1100,
        }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--bg)', color: 'var(--text)',
                    padding: '20px', borderRadius: '10px',
                    maxWidth: '420px', width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {loading ? (
                    <div>Загрузка...</div>
                ) : !info ? (
                    <div>Не удалось загрузить</div>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0 }}>{info.name}</h3>
                        {info.teacher && (
                            <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '12px' }}>
                                👤 {info.teacher}
                            </div>
                        )}

                        {info.nextPairDate ? (
                            <div style={{
                                padding: '12px',
                                background: 'var(--accent-bg)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                            }}>
                                <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px' }}>
                                    Следующая пара:
                                </div>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    {info.nextPairDayOfWeek}, {new Date(info.nextPairDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                </div>
                                <div style={{ fontSize: '13px' }}>
                                    {info.nextPairNumber}-я пара
                                    {info.nextPairTime && ` · ${info.nextPairTime}`}
                                </div>
                                {info.nextPairRoom && (
                                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>📍 {info.nextPairRoom}</div>
                                )}
                                {info.nextPairTeacher && (
                                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>👤 {info.nextPairTeacher}</div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                padding: '12px',
                                background: 'var(--accent-bg)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '13px',
                            }}>
                                У предмета нет пар в расписании
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => setShowAdd(true)}
                                style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                ➕ Добавить ДЗ{info.nextPairDate ? ' на эту пару' : ''}
                            </button>
                            <button
                                onClick={() => { onShowOnCalendar(subjectId); onClose(); }}
                                style={{ padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer' }}
                            >
                                📅 Показать на календаре
                            </button>
                            <button
                                onClick={onClose}
                                style={{ padding: '10px', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                            >
                                Закрыть
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SubjectInfoModal;