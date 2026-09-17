export type WorkingHoursRange = [string, string];

export type WorkingHours = {
  mon: WorkingHoursRange[];
  tue: WorkingHoursRange[];
  wed: WorkingHoursRange[];
  thu: WorkingHoursRange[];
  fri: WorkingHoursRange[];
  sat: WorkingHoursRange[];
  sun: WorkingHoursRange[];
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Business = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  phone: string | null;
  address: string | null;
  working_hours: WorkingHours;
  created_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  color: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  customer_id: string | null;
  staff_id: string | null;
  price_at_booking: number;
  created_at: string;
};

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  loyalty_points: number;
  created_at: string;
};

export type TimeOffRange = {
  start: string;
  end: string;
  reason?: string;
};

export type Staff = {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  photo_url: string | null;
  working_hours: WorkingHours;
  time_off: TimeOffRange[];
  active: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Partial<Business> &
          Pick<Business, "name" | "slug" | "owner_id">;
        Update: Partial<Business>;
        Relationships: [];
      };
      services: {
        Row: Service;
        Insert: Partial<Service> &
          Pick<Service, "business_id" | "name" | "duration_minutes">;
        Update: Partial<Service>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment> &
          Pick<
            Appointment,
            | "business_id"
            | "service_id"
            | "customer_name"
            | "customer_phone"
            | "customer_email"
            | "start_time"
            | "end_time"
          >;
        Update: Partial<Appointment>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer> & Pick<Customer, "business_id" | "name" | "phone">;
        Update: Partial<Customer>;
        Relationships: [];
      };
      staff: {
        Row: Staff;
        Insert: Partial<Staff> & Pick<Staff, "business_id" | "name">;
        Update: Partial<Staff>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
