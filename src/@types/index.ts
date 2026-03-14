// ── Museum ────────────────────────────────────────────────
export interface Museum {
  _id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  description: string;
  type: string;
  establishedYear: number | null;
  openingHours: Record<string, string> | null;
  ticketPrices: {
    adult: number;
    child: number;
    senior: number;
    student: number;
  };
  images: string[];
  facilities: string[];
  contactPhone: string;
  contactEmail: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// ── Booking ───────────────────────────────────────────────
export interface Booking {
  _id: string;
  bookingReference: string;
  user: string;
  museum: Museum | string;
  visitDate: string;
  timeSlot: string;
  adultTickets: number;
  childTickets: number;
  seniorTickets: number;
  studentTickets: number;
  totalAmount: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  specialRequirements: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId: string | null;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayload {
  museumId?: string;           // seeded DB museum
  externalMuseumId?: string;   // previously saved external museum
  llmMuseum?: Record<string, any>; // full LLM-fetched museum object
  visitDate: string;
  timeSlot: string;
  adultTickets: number;
  childTickets: number;
  seniorTickets: number;
  studentTickets: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  specialRequirements?: string;
}

// ── Auth / User ───────────────────────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  preferredLanguage: string;
  role: 'user' | 'admin';
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
  preferredLanguage?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── API Responses ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
