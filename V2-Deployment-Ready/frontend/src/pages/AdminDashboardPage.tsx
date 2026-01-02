import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CalendarComponent, { type CalendarEvent } from '../components/calendar/CalendarComponent';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext'; // Import useThemeMode

interface Trainer {
  id: number;
  username: string;
  email: string;
  specialties?: string;
  experience_years?: number;
}

interface Session {
  id: number;
  trainer: number;
  trainer_username: string;
  course_name?: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  feedback?: string | null;
}

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useThemeMode(); // Access theme mode
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await api.get('/trainers/');
        setTrainers(res.data.results || []);
      } catch (error) {
        console.error("Error fetching trainers:", error);
        setTrainers([]);
      }
    };

    const fetchSessions = async () => {
      try {
        const res = await api.get('/utilizations/');
        setSessions(res.data.results || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    };

    if (user?.role === 'admin') {
      setLoading(true);
      Promise.all([fetchTrainers(), fetchSessions()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setCalendarEvents(
      sessions.map((s) => ({
        id: String(s.id),
        title: `${s.course_name || 'Session'} (${s.trainer_username})`,
        start: s.start_time,
        end: s.end_time,
        extendedProps: {
          trainerUsername: s.trainer_username,
          location: s.location,
          status: s.status,
          feedback: s.feedback,
        },
        textColor: darkMode ? '#fff' : undefined, // Ensure event text color adapts
      }))
    );
  }, [sessions, darkMode]); // Add darkMode to dependency array

  const handleEventClick = (eventInfo: any) => {
    const { event } = eventInfo;
    const { title, start, end, extendedProps } = event;
    alert(
      `Session Details:\n` +
      `Title: ${title}\n` +
      `Trainer: ${extendedProps?.trainerUsername || 'N/A'}\n` +
      `Location: ${extendedProps?.location || 'N/A'}\n` +
      `Start: ${new Date(start).toLocaleString()}\n` +
      `End: ${new Date(end).toLocaleString()}\n` +
      `Status: ${extendedProps?.status || 'N/A'}\n` +
      `Feedback: ${extendedProps?.feedback || '-'}`
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ color: darkMode ? '#f5f5f5' : '#333' }}> {/* Apply text color based on theme */}
      <h2>Admin Dashboard</h2>
      <p>Welcome, <b>{user?.username}</b>!</p>
      <button
        onClick={logout}
        style={{
          background: darkMode ? '#555' : '#e0e0e0',
          color: darkMode ? '#fff' : '#333',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        Logout
      </button>

      <section style={{ marginTop: 24 }}>
        <h3>All Trainers</h3>
        {trainers.length === 0 ? (
          <p>No trainers found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="responsive-table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: darkMode ? '#f5f5f5' : '#333',
            }}>
              <thead>
                <tr style={{ background: darkMode ? '#444' : '#eee' }}>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Username</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Specialties</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Experience</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t.id} style={{ background: darkMode ? '#3a3a3a' : '#fff' }}>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Username">{t.username}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Email">{t.email}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Specialties">{t.specialties || '-'}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Experience">{t.experience_years || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>All Sessions (Calendar View)</h3>
        <div style={{ overflowX: 'auto' }}>
          <CalendarComponent
            events={calendarEvents}
            onEventClick={handleEventClick}
          />
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>All Sessions (Table View)</h3>
        {sessions.length === 0 ? (
          <p>No sessions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="responsive-table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: darkMode ? '#f5f5f5' : '#333',
            }}>
              <thead>
                <tr style={{ background: darkMode ? '#444' : '#eee' }}>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Trainer</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Course</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Location</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Start</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>End</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ background: darkMode ? '#3a3a3a' : '#fff' }}>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Trainer">{s.trainer_username}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Course">{s.course_name || '-'}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Location">{s.location || '-'}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Start">{new Date(s.start_time).toLocaleString()}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="End">{new Date(s.end_time).toLocaleString()}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Status">{s.status}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Feedback">{s.feedback || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* The responsive-table styles are duplicated, consider moving to a global CSS file */}
      <style>{`
        /* Global table styles for better dark mode */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid ${darkMode ? '#555' : '#ddd'}; /* Theme-dependent border */
        }
        thead tr {
          background-color: ${darkMode ? '#444' : '#f2f2f2'}; /* Theme-dependent header background */
        }
        tbody tr:nth-child(even) {
          background-color: ${darkMode ? '#3a3a3a' : '#f9f9f9'}; /* Theme-dependent even row background */
        }
        tbody tr:hover {
          background-color: ${darkMode ? '#505050' : '#f1f1f1'}; /* Theme-dependent hover background */
        }

        @media (max-width: 700px) {
          .responsive-table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr {
            display: block;
          }
          .responsive-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
          .responsive-table tr {
            margin-bottom: 1rem;
            border: 1px solid ${darkMode ? '#666' : '#ddd'}; /* Theme-dependent border */
            border-radius: 8px;
            overflow: hidden;
            background: ${darkMode ? '#3a3a3a' : '#fff'};
          }
          .responsive-table td {
            border: none;
            position: relative;
            padding-left: 50%;
            white-space: pre-line;
            min-height: 2.5rem;
            color: ${darkMode ? '#f5f5f5' : '#333'}; /* Ensure text color adapts */
          }
          .responsive-table td:before {
            position: absolute;
            top: 0;
            left: 0;
            width: 45%;
            padding-left: 0.75rem;
            font-weight: bold;
            white-space: pre-line;
            content: attr(data-label);
            color: ${darkMode ? '#bbb' : '#555'}; /* Label color */
          }
          .responsive-table td:last-child {
            border-bottom: none; /* No bottom border for the last td */
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;