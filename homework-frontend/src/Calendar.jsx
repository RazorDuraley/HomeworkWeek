import React, { useState } from 'react';
import DayModal from './DayModal';
import { toLocalDateString } from './utils/date';

const Calendar = ({ selectedSubjectId, homeworks, onUpdate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const filteredHomeworks = selectedSubjectId
        ? homeworks.filter(h => h.subjectId === selectedSubjectId)
        : homeworks;

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getHomeworksForDay = (day) => {
        if (!day) return [];
        const dateStr = toLocalDateString(day);
        return filteredHomeworks.filter(h => h.dueDate === dateStr);
    };

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={() => changeMonth(-1)}>←</button>
                <h2>{monthName}</h2>
                <button onClick={() => changeMonth(1)}>→</button>
            </div>

            <div className="calendar-grid">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="calendar-weekday">{d}</div>
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
                            className={`calendar-day ${isToday ? 'today' : ''} ${day ? '' : 'empty'}`}
                        >
                            {day && (
                                <>
                                    <div className="calendar-day-number">{day.getDate()}</div>
                                    {dayHomeworks.length > 0 && (
                                        <div className="calendar-day-badge">{dayHomeworks.length}</div>
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