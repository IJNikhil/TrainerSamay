// export interface Booking {
//   id: number;
//   user: number;
//   trainer: number;
//   start_time: string;
//   end_time: string;
//   status: string;
//   notes?: string;
// }

export interface Booking {
  id: number;
  user: number;
  user_username: string;
  trainer: number;
  trainer_username: string;
  course_name: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
