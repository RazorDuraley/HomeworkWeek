import React, { useState, useEffect } from 'react';
import api from './api';
import Calendar from './Calendar';
import Sidebar from './Sidebar';

function App() {
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [homeworks, setHomeworks] = useState([]);

    const loadHomeworks = () => {
        api.get('/api/homework')
            .then(res => setHomeworks(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error('Ошибка загрузки:', err));
    };

    useEffect(() => {
        loadHomeworks();
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={setSelectedSubjectId}
                homeworks={homeworks}
            />
            <div style={{ flex: 1, padding: '20px' }}>
                <h1>📚 Домашка</h1>
                <Calendar
                    selectedSubjectId={selectedSubjectId}
                    homeworks={homeworks}
                    onUpdate={loadHomeworks}
                />
            </div>
        </div>
    );
}

export default App;