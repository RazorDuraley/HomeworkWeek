import React, { useState } from 'react';
import DayModal from './DayModal';

const Calendar = ({ selectedSubjectId, homeworks, onUpdate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Фильтр по предмету
    const filteredHomeworks = selectedSubjectId
        ? homeworks.filter(h => h.subjectId === selectedSubjectId)
        : homeworks;

    // Получить дни месяца
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Пустые клетки до первого дня
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    // Задания на конкретный день
    const getHomeworksForDay = (day) => {
        if (!day) return [];
        const dateStr = day.toISOString().split('T')[0];
        return filteredHomeworks.filter(h => h.dueDate.split('T')[0] === dateStr);
    };

    // Переключение месяца
    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => changeMonth(-1)}>←</button>
                <h2>{monthName}</h2>
                <button onClick={() => changeMonth(1)}>→</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginTop: '20px' }}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontWeight: 'bold' }}>{d}</div>
                ))}

                {days.map((day, i) => {
                    const dayHomeworks = getHomeworksForDay(day);
                    const isToday = day && day.toDateString() === new Date().toDateString();
                    return (
                        <div
                            key={i}
                            onClick={() => {
                                if (day) {
                                    setSelectedDay(day);
                                    setShowModal(true);
                                }
                            }}
                            style={{
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                minHeight: '60px',
                                cursor: day ? 'pointer' : 'default',
                                background: isToday ? '#e3f2fd' : 'white',
                                position: 'relative',
                            }}
                        >
                            {day && (
                                <>
                                    <div style={{ fontWeight: 'bold' }}>{day.getDate()}</div>
                                    {dayHomeworks.length > 0 && (
                                        <div style={{
                                            fontSize: '10px',
                                            background: '#ff9800',
                                            color: 'white',
                                            borderRadius: '10px',
                                            padding: '1px 5px',
                                            display: 'inline-block',
                                            marginTop: '2px',
                                        }}>
                                            {dayHomeworks.length}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && selectedDay && (
                <DayModal
                    day={selectedDay}
                    homeworks={getHomeworksForDay(selectedDay)}
                    onClose={() => setShowModal(false)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};

export default Calendar;