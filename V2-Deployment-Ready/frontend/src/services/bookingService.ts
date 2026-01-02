import api from './api';
import type { Booking } from '../types/booking';

export const fetchTrainerBookings = async (trainerId: number): Promise<Booking[]> => {
  const response = await api.get(`/bookings/?trainer=${trainerId}`);
  return response.data.results;
};

export const fetchAllBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/');
  return response.data.results;
};
