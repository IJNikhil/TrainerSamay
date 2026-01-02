def generate_ics_for_trainer(trainer, booking_data):
    ics_content = "BEGIN:VCALENDAR\nVERSION:2.0\n"
    for booking in booking_data:
        ics_content += (
            "BEGIN:VEVENT\n"
            f"SUMMARY:Session with {trainer.username}\n"
            f"DTSTART:{booking.start_time.strftime('%Y%m%dT%H%M%S')}\n"
            f"DTEND:{booking.end_time.strftime('%Y%m%dT%H%M%S')}\n"
            f"DESCRIPTION:{booking.notes or ''}\n"
            "END:VEVENT\n"
        )
    ics_content += "END:VCALENDAR"
    return ics_content
