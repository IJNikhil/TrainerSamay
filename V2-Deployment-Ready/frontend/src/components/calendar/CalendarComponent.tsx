import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  extendedProps?: {
    location?: string;
    status?: string;
    notes?: string;
    trainerUsername?: string;
    userUsername?: string;
  };
  backgroundColor?: string;
  borderColor?: string;
}

interface CalendarComponentProps {
  events: CalendarEvent[];
  onEventClick: (eventInfo: any) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ events, onEventClick }) => (
  <div className="calendar-container" style={{ margin: '1rem 0' }}>
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      }}
      weekends={true}
      events={events}
      eventClick={onEventClick}
      height="auto"
    />
  </div>
);

export default CalendarComponent;
