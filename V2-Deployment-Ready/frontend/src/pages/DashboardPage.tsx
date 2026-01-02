import React, { useEffect, useState, useCallback } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CalendarComponent, { type CalendarEvent } from '../components/calendar/CalendarComponent';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext'; // Import useThemeMode

interface Utilization {
  id: number;
  course_name: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  feedback?: string | null;
  notes?: string | null;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode } = useThemeMode(); // Access theme mode
  const [sessions, setSessions] = useState<Utilization[]>([]);
  const [nextSession, setNextSession] = useState<Utilization | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ [id: number]: string }>({});
  const [submitting, setSubmitting] = useState<{ [id: number]: boolean }>({});

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get(`/utilizations/?trainer=${user?.id}`);
      setSessions(res.data.results || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  }, [user]);

  const fetchNextSession = useCallback(async () => {
    try {
      const res = await api.get('/users/my_next_session/');
      setNextSession(res.data && res.data.id ? res.data : null);
    } catch (error) {
      console.error("Error fetching next session:", error);
      setNextSession(null);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'trainer') {
      setLoading(true);
      Promise.all([fetchSessions(), fetchNextSession()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, fetchSessions, fetchNextSession]);

  useEffect(() => {
    setCalendarEvents(
      sessions.map((s) => ({
        id: String(s.id),
        title: s.course_name || 'Session',
        start: s.start_time,
        end: s.end_time,
        extendedProps: {
          status: s.status,
          feedback: s.feedback ?? undefined,
          notes: s.notes ?? undefined,
          location: s.location ?? undefined,
        },
        backgroundColor: nextSession && s.id === nextSession.id ? '#28a745' : undefined,
        borderColor: nextSession && s.id === nextSession.id ? '#218838' : undefined,
        textColor: darkMode ? '#fff' : undefined, // Ensure event text color adapts to theme
      }))
    );
  }, [sessions, nextSession, darkMode]);

  const handleFeedbackChange = (id: number, value: string) => {
    setFeedback((prev) => ({ ...prev, [id]: value }));
  };

  const handleComplete = async (id: number) => {
    setSubmitting((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/utilizations/${id}/`, {
        status: 'completed',
        feedback: feedback[id] || '',
      });
      await fetchSessions();
      setFeedback((prev) => ({ ...prev, [id]: '' }));
    } catch (error) {
      console.error("Failed to mark as completed:", error);
      alert('Failed to mark as completed. Please try again.');
    } finally {
      setSubmitting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleEventClick = (eventInfo: any) => {
    const { event } = eventInfo;
    const { title, start, end, extendedProps } = event;
    alert(
      `Session Details:\n` +
      `Title: ${title}\n` +
      `Location: ${extendedProps?.location || 'N/A'}\n` +
      `Start: ${new Date(start).toLocaleString()}\n` +
      `End: ${new Date(end).toLocaleString()}\n` +
      `Status: ${extendedProps?.status || 'N/A'}\n` +
      `Notes: ${extendedProps?.notes || '-'}\n` +
      `Feedback: ${extendedProps?.feedback || '-'}`
    );
  };

  if (loading) return <LoadingSpinner />; // Show spinner while dashboard data is loading

  return (
    <div style={{ color: darkMode ? '#f5f5f5' : '#333' }}>
      <h2>Trainer Dashboard</h2>
      <p>Welcome, <b>{user?.username}</b>!</p>
      <p>Your role: <b>{user?.role}</b></p>
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
        <h3>My Next Session</h3>
        {nextSession ? (
          <div style={{
            border: '2px solid #28a745',
            padding: 12,
            borderRadius: 8,
            marginBottom: 24,
            background: darkMode ? '#2d4d2b' : '#eafbe7',
            color: darkMode ? '#fff' : '#333',
          }}>
            <p><b>Course:</b> {nextSession.course_name || 'N/A'}</p>
            <p><b>Start:</b> {new Date(nextSession.start_time).toLocaleString()}</p>
            <p><b>End:</b> {new Date(nextSession.end_time).toLocaleString()}</p>
            <p><b>Status:</b> {nextSession.status}</p>
            <p><b>Feedback:</b> {nextSession.feedback || '-'}</p>
          </div>
        ) : (
          <p>No upcoming sessions.</p>
        )}
      </section>

      <section>
        <h3>My Calendar</h3>
        <CalendarComponent
          events={calendarEvents}
          onEventClick={handleEventClick}
        />
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>All My Sessions</h3>
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
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Course</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Start</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>End</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Location</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Notes</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Feedback</th>
                  <th style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ background: darkMode ? '#3a3a3a' : '#fff' }}>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Course">{s.course_name}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Start">{new Date(s.start_time).toLocaleString()}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="End">{new Date(s.end_time).toLocaleString()}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Location">{s.location}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Status">{s.status}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Notes">{s.notes || '-'}</td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Feedback">
                      {s.status === 'completed' ? (
                        s.feedback || '-'
                      ) : (
                        <textarea
                          value={feedback[s.id] ?? s.feedback ?? ''}
                          onChange={e => handleFeedbackChange(s.id, e.target.value)}
                          rows={2}
                          style={{
                            width: '100%',
                            background: darkMode ? '#555' : '#fff',
                            color: darkMode ? '#fff' : '#333',
                            border: darkMode ? '1px solid #666' : '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '8px',
                          }}
                          placeholder="Enter feedback"
                          disabled={submitting[s.id]}
                        />
                      )}
                    </td>
                    <td style={{ border: darkMode ? '1px solid #555' : '1px solid #ddd', padding: '8px' }} data-label="Action">
                      {s.status !== 'completed' && (
                        <button
                          onClick={() => handleComplete(s.id)}
                          disabled={submitting[s.id]}
                          style={{
                            background: darkMode ? '#007bff' : '#0056b3',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: submitting[s.id] ? 0.7 : 1,
                          }}
                        >
                          {submitting[s.id] ? 'Submitting...' : 'Mark as Completed'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <style>{`
        /* Global table styles for better dark mode */
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid ${darkMode ? '#555' : '#ddd'};
        }
        thead tr {
          background-color: ${darkMode ? '#444' : '#f2f2f2'};
        }
        tbody tr:nth-child(even) {
          background-color: ${darkMode ? '#3a3a3a' : '#f9f9f9'};
        }
        tbody tr:hover {
          background-color: ${darkMode ? '#505050' : '#f1f1f1'};
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
            border: 1px solid ${darkMode ? '#666' : '#ddd'};
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
            color: ${darkMode ? '#f5f5f5' : '#333'};
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
            color: ${darkMode ? '#bbb' : '#555'};
          }
          .responsive-table td:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;