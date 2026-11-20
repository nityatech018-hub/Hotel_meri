export type CategoryId = "deluxe" | "premium" | "executive" | "family" | "suite";

export interface RoomCategory {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  /** Sample price per night in INR — demo data, edit in data.ts */
  price: number;
  maxGuests: number;
  bed: string;
  size: string;
  image: string;
  amenities: string[];
}

export type RoomStatus = "available" | "cleaning" | "maintenance";

export interface Room {
  number: string;
  categoryId: CategoryId;
  floor: number;
  status: RoomStatus;
}

export type BookingStatus = "Pending" | "Confirmed" | "Checked-In" | "Checked-Out" | "Cancelled";
export type PaymentStatus = "Paid" | "Partial" | "Unpaid" | "Refunded";
export type BookingSource = "Website" | "Walk-in" | "Phone";

export interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  categoryId: CategoryId;
  roomNumber?: string | undefined;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  rooms: number;
  status: BookingStatus;
  payment: PaymentStatus;
  amountPaid: number;
  total: number;
  source: BookingSource;
  createdAt: string; // YYYY-MM-DD
  requests?: string | undefined;
}

export type Role = "guest" | "reception";

export interface UserAccount {
  email: string;
  password: string;
  name: string;
  phone: string;
  city?: string | undefined;
  role: Role;
}

export interface Session {
  email: string;
  name: string;
  role: Role;
}

export interface SupportMessage {
  id: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface HotelSettings {
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  checkInTime: string;
  checkOutTime: string;
  taxRate: number;
}

export interface HotelState {
  version: number;
  categories: RoomCategory[];
  rooms: Room[];
  bookings: Booking[];
  users: UserAccount[];
  session: Session | null;
  messages: SupportMessage[];
  settings: HotelSettings;
}
