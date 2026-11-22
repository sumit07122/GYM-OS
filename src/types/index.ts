// GymOS Enterprise TypeScript Type Definitions

export type GymRole = 'gym_owner' | 'gym_manager' | 'receptionist' | 'trainer' | 'member' | 'platform_super_admin';

export type MemberStatus = 'active' | 'expiring' | 'expired' | 'frozen' | 'inactive';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque' | 'other';

export type PaymentType = 
  | 'membership_fee' 
  | 'registration_fee' 
  | 'personal_training' 
  | 'merchandise' 
  | 'supplement' 
  | 'locker_fee' 
  | 'renewal' 
  | 'penalty_fee' 
  | 'refund';

export type AttendanceMethod = 'qr_scan' | 'reception_manual' | 'biometric' | 'mobile_app';

export type LeadStatus = 'new' | 'contacted' | 'trial_scheduled' | 'trial_attended' | 'converted' | 'lost';

export type BillingInterval = 'monthly' | 'yearly' | 'one_time';

export type SaasSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'suspended' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  legal_business_name?: string;
  gstin?: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface GymSettings {
  id: string;
  gym_id: string;
  invoice_prefix: string;
  invoice_next_number: number;
  currency: string;
  tax_rate_percent: number;
  is_tax_inclusive: boolean;
  attendance_qr_refresh_seconds: number;
  allow_member_portal_renewals: boolean;
  max_freeze_days_per_year: number;
}

export interface GymBranding {
  id: string;
  gym_id: string;
  logo_url?: string;
  primary_color: string;
  accent_color: string;
  tagline?: string;
  website_url?: string;
}

export interface GymStaff {
  id: string;
  gym_id: string;
  user_id: string;
  role: GymRole;
  custom_permissions: string[];
  salary_monthly: number;
  is_active: boolean;
  joined_at: string;
  profile?: UserProfile;
}

export interface Trainer {
  id: string;
  staff_id: string;
  gym_id: string;
  specialization: string[];
  pt_commission_percent: number;
  max_clients: number;
  bio?: string;
  staff?: GymStaff;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  duration_days: number;
  price: number;
  admission_fee: number;
  is_pt_included: boolean;
  pt_sessions_count: number;
  description?: string;
  is_active: boolean;
}

export interface Member {
  id: string;
  gym_id: string;
  user_id?: string;
  member_code: string;
  full_name: string;
  email?: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  medical_conditions?: string;
  profile_photo_url?: string;
  assigned_trainer_id?: string;
  assigned_trainer?: Trainer;
  status: MemberStatus;
  joining_date: string;
  created_at: string;
  current_subscription?: MemberSubscription;
}

export interface MemberSubscription {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string;
  plan?: MembershipPlan;
  start_date: string;
  end_date: string;
  is_frozen: boolean;
  freeze_start_date?: string;
  freeze_end_date?: string;
  status: MemberStatus;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  gym_id: string;
  member_id: string;
  member?: Member;
  check_in_time: string;
  check_out_time?: string;
  method: AttendanceMethod;
  verified_by_staff_id?: string;
  verified_by_name?: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  member?: Member;
  subscription_id?: string;
  invoice_number: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount_paid: number;
  tax_amount: number;
  discount_amount: number;
  balance_due: number;
  due_date?: string;
  transaction_reference?: string;
  notes?: string;
  created_by_staff_id?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  gym_id: string;
  category: string;
  amount: number;
  payment_method: PaymentMethod;
  date: string;
  vendor_name?: string;
  receipt_url?: string;
  notes?: string;
  recorded_by_staff_id?: string;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_plan_id: string;
  day_of_week: string;
  exercise_name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  target_weight_kg?: number;
  rest_seconds: number;
  demonstration_url?: string;
  order_index: number;
}

export interface WorkoutPlan {
  id: string;
  gym_id: string;
  member_id?: string;
  trainer_id?: string;
  title: string;
  goal?: string;
  difficulty_level: string;
  notes?: string;
  is_template: boolean;
  exercises?: WorkoutExercise[];
  created_at: string;
}

export interface DietMeal {
  id: string;
  diet_plan_id: string;
  meal_name: string;
  time_of_day?: string;
  food_items: string;
  calories: number;
  protein_grams: number;
  order_index: number;
}

export interface DietPlan {
  id: string;
  gym_id: string;
  member_id?: string;
  trainer_id?: string;
  title: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  water_liters: number;
  notes?: string;
  is_template: boolean;
  meals?: DietMeal[];
  created_at: string;
}

export interface MemberMeasurement {
  id: string;
  gym_id: string;
  member_id: string;
  measured_at: string;
  weight_kg: number;
  body_fat_percent?: number;
  chest_cm?: number;
  waist_cm?: number;
  biceps_cm?: number;
  thighs_cm?: number;
  notes?: string;
}

export interface Lead {
  id: string;
  gym_id: string;
  full_name: string;
  phone: string;
  email?: string;
  source: string;
  interested_plan_id?: string;
  interested_plan?: MembershipPlan;
  status: LeadStatus;
  follow_up_date?: string;
  assigned_staff_id?: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  gym_id: string;
  user_id?: string;
  member_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  channel: 'in_app' | 'whatsapp' | 'email' | 'sms';
  is_read: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  setup_fee: number;
  price_monthly: number;
  price_yearly: number;
  max_members: number;
  max_staff: number;
  features: string[];
  is_active: boolean;
}

export interface GymSubscription {
  id: string;
  gym_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  status: SaasSubscriptionStatus;
  billing_interval: BillingInterval;
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  setup_fee_paid: boolean;
}

export interface AuditLog {
  id: string;
  gym_id?: string;
  actor_user_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, unknown>;
  created_at: string;
}
