// GymOS Autonomous Multi-Tenant Store & State Engine
// Supports in-memory, localStorage persistence, and Supabase PostgREST synchronization

import { 
  Gym, GymSettings, GymBranding, GymStaff, Trainer, Member, 
  MembershipPlan, MemberSubscription, AttendanceRecord, Payment, 
  Expense, WorkoutPlan, DietPlan, MemberMeasurement, Lead, 
  Notification, GymSubscription, AuditLog 
} from '@/types';
import { calculateGST } from '@/lib/formatting/currency';
import { calculateDistanceMeters, isWithinGeofence, formatDistance } from '@/lib/geo/distance';

const STORAGE_KEY = 'gymos_enterprise_store_v1';

interface StoreState {
  gyms: Gym[];
  settings: Record<string, GymSettings>;
  branding: Record<string, GymBranding>;
  staff: GymStaff[];
  trainers: Trainer[];
  membershipPlans: MembershipPlan[];
  members: Member[];
  subscriptions: MemberSubscription[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  expenses: Expense[];
  workouts: WorkoutPlan[];
  diets: DietPlan[];
  measurements: MemberMeasurement[];
  leads: Lead[];
  notifications: Notification[];
  gymSubscriptions: GymSubscription[];
  auditLogs: AuditLog[];
}

const INITIAL_GYM: Gym = {
  id: 'gym-001-olympia',
  name: 'Olympia Elite Fitness',
  slug: 'olympia-fitness',
  legal_business_name: 'Olympia Fitness Enterprises LLP',
  gstin: '27AABCO1234F1Z5',
  phone: '+91 98201 12345',
  email: 'contact@olympiafitness.in',
  address_line1: 'Plot 42, Sector 17, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  country: 'India',
  timezone: 'Asia/Kolkata',
  is_active: true,
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
};

const INITIAL_SETTINGS: GymSettings = {
  id: 'set-001',
  gym_id: 'gym-001-olympia',
  invoice_prefix: 'OLY',
  invoice_next_number: 105,
  currency: 'INR',
  tax_rate_percent: 18,
  is_tax_inclusive: false,
  attendance_qr_refresh_seconds: 60,
  allow_member_portal_renewals: true,
  max_freeze_days_per_year: 30,
  latitude: 19.0596, // Bandra West, Mumbai
  longitude: 72.8295,
  geofence_radius_meters: 100,
  enable_gps_attendance: true,
};

const INITIAL_BRANDING: GymBranding = {
  id: 'brand-001',
  gym_id: 'gym-001-olympia',
  logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
  primary_color: '#10B981',
  accent_color: '#059669',
  tagline: 'Forge Your Greatest Physique',
  website_url: 'https://olympiafitness.in',
};

const INITIAL_STAFF: GymStaff[] = [
  {
    id: 'staff-001',
    gym_id: 'gym-001-olympia',
    user_id: 'user-owner',
    role: 'gym_owner',
    custom_permissions: ['all'],
    salary_monthly: 150000,
    is_active: true,
    joined_at: '2024-01-01',
    profile: {
      id: 'user-owner',
      email: 'owner@olympiafitness.in',
      full_name: 'Vikramaditya Singhania',
      phone: '+91 98201 12345',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: '2024-01-01',
    },
  },
  {
    id: 'staff-002',
    gym_id: 'gym-001-olympia',
    user_id: 'user-trainer-1',
    role: 'trainer',
    custom_permissions: ['workouts.manage', 'diets.manage'],
    salary_monthly: 45000,
    is_active: true,
    joined_at: '2024-03-15',
    profile: {
      id: 'user-trainer-1',
      email: 'kabir.sharma@olympiafitness.in',
      full_name: 'Kabir Sharma',
      phone: '+91 98330 99881',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: '2024-03-15',
    },
  },
  {
    id: 'staff-003',
    gym_id: 'gym-001-olympia',
    user_id: 'user-rec-1',
    role: 'receptionist',
    custom_permissions: ['attendance.checkin', 'finance.collect'],
    salary_monthly: 25000,
    is_active: true,
    joined_at: '2024-04-01',
    profile: {
      id: 'user-rec-1',
      email: 'pooja.verma@olympiafitness.in',
      full_name: 'Pooja Verma',
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: '2024-04-01',
    },
  },
];

const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'tr-001',
    staff_id: 'staff-002',
    gym_id: 'gym-001-olympia',
    specialization: ['Hypertrophy', 'Strength Conditioning', 'Fat Loss'],
    pt_commission_percent: 25,
    max_clients: 20,
    bio: 'Certified CSCS coach with 8+ years coaching national powerlifters and transformation athletes.',
    staff: INITIAL_STAFF[1],
  },
];

const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1-yr',
    gym_id: 'gym-001-olympia',
    name: '12 Months Annual Elite',
    duration_days: 365,
    price: 18000,
    admission_fee: 1000,
    is_pt_included: true,
    pt_sessions_count: 5,
    description: 'Full facility access, locker, sauna, and 5 complimentary personal training sessions.',
    is_active: true,
  },
  {
    id: 'plan-6-mo',
    gym_id: 'gym-001-olympia',
    name: '6 Months Half-Yearly Pro',
    duration_days: 180,
    price: 11000,
    admission_fee: 1000,
    is_pt_included: false,
    pt_sessions_count: 0,
    description: 'Complete gym and cardio floor access for 6 continuous months.',
    is_active: true,
  },
  {
    id: 'plan-3-mo',
    gym_id: 'gym-001-olympia',
    name: '3 Months Quarterly Starter',
    duration_days: 90,
    price: 6500,
    admission_fee: 500,
    is_pt_included: false,
    pt_sessions_count: 0,
    description: 'Ideal starter package for seasonal fitness goals.',
    is_active: true,
  },
  {
    id: 'plan-1-mo',
    gym_id: 'gym-001-olympia',
    name: '1 Month Monthly Flex',
    duration_days: 30,
    price: 2500,
    admission_fee: 500,
    is_pt_included: false,
    pt_sessions_count: 0,
    description: 'No commitment monthly pass.',
    is_active: true,
  },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    gym_id: 'gym-001-olympia',
    user_id: 'user-member-1',
    member_code: 'M-00101',
    full_name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98200 44551',
    gender: 'Male',
    date_of_birth: '1996-05-14',
    blood_group: 'O+',
    emergency_contact_name: 'Sunita Mehta (Mother)',
    emergency_contact_phone: '+91 98200 44550',
    address: 'B-402, Raheja Vistas, Bandra West, Mumbai',
    medical_conditions: 'Mild lower back sensitivity. Clear for hypertrophy.',
    profile_photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    assigned_trainer_id: 'tr-001',
    status: 'active',
    joining_date: '2024-01-10',
    created_at: '2024-01-10',
  },
  {
    id: 'mem-002',
    gym_id: 'gym-001-olympia',
    member_code: 'M-00102',
    full_name: 'Rhea Deshmukh',
    email: 'rhea.deshmukh@outlook.com',
    phone: '+91 98199 77882',
    gender: 'Female',
    date_of_birth: '1998-11-22',
    blood_group: 'B+',
    emergency_contact_name: 'Anil Deshmukh (Father)',
    emergency_contact_phone: '+91 98199 77880',
    address: '12, Sea Breeze Apts, Khar Danda, Mumbai',
    status: 'expiring',
    joining_date: '2024-05-28',
    created_at: '2024-05-28',
  },
  {
    id: 'mem-003',
    gym_id: 'gym-001-olympia',
    member_code: 'M-00103',
    full_name: 'Rohan Kapoor',
    email: 'rohan.kapoor@gmail.com',
    phone: '+91 97690 11223',
    gender: 'Male',
    date_of_birth: '1992-08-04',
    status: 'expired',
    joining_date: '2023-11-15',
    created_at: '2023-11-15',
  },
];

const INITIAL_SUBSCRIPTIONS: MemberSubscription[] = [
  {
    id: 'sub-001',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-001',
    plan_id: 'plan-1-yr',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    is_frozen: false,
    status: 'active',
    created_at: '2026-01-01',
  },
  {
    id: 'sub-002',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-002',
    plan_id: 'plan-6-mo',
    start_date: '2026-05-28',
    end_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], // 4 days left
    is_frozen: false,
    status: 'expiring',
    created_at: '2026-05-28',
  },
  {
    id: 'sub-003',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-003',
    plan_id: 'plan-3-mo',
    start_date: '2026-08-01',
    end_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // Expired 5 days ago
    is_frozen: false,
    status: 'expired',
    created_at: '2026-08-01',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-001',
    subscription_id: 'sub-001',
    invoice_number: 'OLY-2026-0101',
    payment_type: 'membership_fee',
    payment_method: 'upi',
    amount_paid: 22420,
    tax_amount: 3420,
    discount_amount: 0,
    balance_due: 0,
    transaction_reference: 'UPI/402819283719/Paytm',
    notes: 'Annual Membership full payment including 18% GST',
    created_at: '2026-01-01T10:15:00Z',
  },
  {
    id: 'pay-002',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-002',
    subscription_id: 'sub-002',
    invoice_number: 'OLY-2026-0102',
    payment_type: 'membership_fee',
    payment_method: 'card',
    amount_paid: 10000,
    tax_amount: 1980,
    discount_amount: 0,
    balance_due: 2980,
    due_date: '2026-11-30',
    transaction_reference: 'HDFC-POS-892182',
    notes: 'Partial payment. Balance due ₹2,980 by month-end.',
    created_at: '2026-05-28T14:30:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-001',
    gym_id: 'gym-001-olympia',
    category: 'Rent',
    amount: 125000,
    payment_method: 'bank_transfer',
    date: '2026-11-01',
    vendor_name: 'Bandra Commercial Properties Ltd',
    notes: 'Gym facility premises monthly lease',
    created_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 'exp-002',
    gym_id: 'gym-001-olympia',
    category: 'Electricity',
    amount: 38450,
    payment_method: 'upi',
    date: '2026-11-05',
    vendor_name: 'Adani Electricity Mumbai',
    notes: 'Floor lighting, heavy AC load, sound system',
    created_at: '2026-11-05T11:20:00Z',
  },
  {
    id: 'exp-003',
    gym_id: 'gym-001-olympia',
    category: 'Maintenance',
    amount: 8500,
    payment_method: 'cash',
    date: '2026-11-12',
    vendor_name: 'FitFix Technical Services',
    notes: 'Treadmill belt lubrication and cable machine adjustment',
    created_at: '2026-11-12T16:45:00Z',
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-001',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-001',
    check_in_time: new Date(Date.now() - 2 * 3600000).toISOString(),
    method: 'qr_scan',
    verified_by_name: 'Self Scan Kiosk',
  },
  {
    id: 'att-002',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-002',
    check_in_time: new Date(Date.now() - 4 * 3600000).toISOString(),
    method: 'reception_manual',
    verified_by_name: 'Pooja Verma',
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-001',
    gym_id: 'gym-001-olympia',
    full_name: 'Siddharth Malhotra',
    phone: '+91 99301 23456',
    email: 'sid.m@gmail.com',
    source: 'Instagram Ad',
    interested_plan_id: 'plan-1-yr',
    status: 'trial_scheduled',
    follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: 'Looking for 1-on-1 personal training for posture and fat loss.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'lead-002',
    gym_id: 'gym-001-olympia',
    full_name: 'Ananya Sharma',
    phone: '+91 98200 99112',
    source: 'Walk-in',
    interested_plan_id: 'plan-6-mo',
    status: 'new',
    follow_up_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    notes: 'Visited morning slot. Interested in Zumba + Gym floor combo.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const INITIAL_WORKOUTS: WorkoutPlan[] = [
  {
    id: 'wo-001',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-001',
    trainer_id: 'tr-001',
    title: '4-Day Hypertrophy & Power Split',
    goal: 'Lean Muscle Gain & Core Stability',
    difficulty_level: 'Advanced',
    notes: 'Prioritize mechanical tension on compound movements. Rest 90-120s between working sets.',
    is_template: false,
    created_at: '2024-02-01',
    exercises: [
      {
        id: 'ex-001',
        workout_plan_id: 'wo-001',
        day_of_week: 'Monday',
        exercise_name: 'Barbell Incline Bench Press',
        muscle_group: 'Chest',
        sets: 4,
        reps: '8-10',
        target_weight_kg: 85,
        rest_seconds: 90,
        order_index: 1,
      },
      {
        id: 'ex-002',
        workout_plan_id: 'wo-001',
        day_of_week: 'Monday',
        exercise_name: 'Dumbbell Romanian Deadlift',
        muscle_group: 'Hamstrings / Glutes',
        sets: 3,
        reps: '10-12',
        target_weight_kg: 34,
        rest_seconds: 90,
        order_index: 2,
      },
      {
        id: 'ex-003',
        workout_plan_id: 'wo-001',
        day_of_week: 'Tuesday',
        exercise_name: 'Weighted Pull-Ups',
        muscle_group: 'Back / Lats',
        sets: 4,
        reps: '6-8',
        target_weight_kg: 15,
        rest_seconds: 120,
        order_index: 1,
      },
    ],
  },
];

const INITIAL_DIETS: DietPlan[] = [
  {
    id: 'dp-001',
    gym_id: 'gym-001-olympia',
    member_id: 'mem-001',
    trainer_id: 'tr-001',
    title: 'High Protein Indian Clean Lean Bulk (2500 kcal)',
    daily_calories: 2500,
    protein_grams: 175,
    carbs_grams: 275,
    fats_grams: 65,
    water_liters: 4.0,
    notes: 'Focus on clean hydration and adequate sleep. Post-workout whey within 45 mins.',
    is_template: false,
    created_at: '2024-02-01',
    meals: [
      {
        id: 'm-001',
        diet_plan_id: 'dp-001',
        meal_name: 'Breakfast (08:30 AM)',
        time_of_day: '08:30 AM',
        food_items: '4 Whole Eggs Omelette with spinach + 2 Slices Multigrain Bread + 1 Banana',
        calories: 550,
        protein_grams: 32,
        order_index: 1,
      },
      {
        id: 'm-002',
        diet_plan_id: 'dp-001',
        meal_name: 'Lunch (01:30 PM)',
        time_of_day: '01:30 PM',
        food_items: '200g Grilled Chicken Breast or 250g Paneer Bhurji + 150g Steamed Basmati Rice + Yellow Dal Bowl + Cucumber Salad',
        calories: 750,
        protein_grams: 52,
        order_index: 2,
      },
      {
        id: 'm-003',
        diet_plan_id: 'dp-001',
        meal_name: 'Evening Pre-Workout (05:30 PM)',
        time_of_day: '05:30 PM',
        food_items: 'Oatmeal 60g in Almond Milk with 1 scoop Whey Protein Isolate + Handful Almonds',
        calories: 450,
        protein_grams: 36,
        order_index: 3,
      },
      {
        id: 'm-004',
        diet_plan_id: 'dp-001',
        meal_name: 'Dinner (09:00 PM)',
        time_of_day: '09:00 PM',
        food_items: '2 Multigrain Rotis with Ghee + 150g Soya Chunks Curry or Fish Fillet + Mixed Green Salad',
        calories: 600,
        protein_grams: 48,
        order_index: 4,
      },
    ],
  },
];

class GymStore {
  private state: StoreState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): StoreState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial
    }

    const initial: StoreState = {
      gyms: [INITIAL_GYM],
      settings: { [INITIAL_GYM.id]: INITIAL_SETTINGS },
      branding: { [INITIAL_GYM.id]: INITIAL_BRANDING },
      staff: INITIAL_STAFF,
      trainers: INITIAL_TRAINERS,
      membershipPlans: INITIAL_PLANS,
      members: INITIAL_MEMBERS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      attendance: INITIAL_ATTENDANCE,
      payments: INITIAL_PAYMENTS,
      expenses: INITIAL_EXPENSES,
      workouts: INITIAL_WORKOUTS,
      diets: INITIAL_DIETS,
      measurements: [],
      leads: INITIAL_LEADS,
      notifications: [],
      gymSubscriptions: [
        {
          id: 'gs-001',
          gym_id: INITIAL_GYM.id,
          plan_id: 'professional',
          status: 'active',
          billing_interval: 'monthly',
          current_period_start: new Date(Date.now() - 15 * 86400000).toISOString(),
          current_period_end: new Date(Date.now() + 15 * 86400000).toISOString(),
          setup_fee_paid: true,
        },
      ],
      auditLogs: [],
    };

    this.saveState(initial);
    return initial;
  }

  private saveState(state: StoreState) {
    this.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or SSR safe
    }
  }

  // --- Gym & Settings ---
  getGym(idOrSlug: string): Gym | undefined {
    return this.state.gyms.find(g => g.id === idOrSlug || g.slug === idOrSlug);
  }

  getGymBySlug(slug: string): Gym | undefined {
    return this.state.gyms.find(g => g.slug === slug);
  }

  updateGym(gymId: string, updates: Partial<Gym>): Gym | undefined {
    const idx = this.state.gyms.findIndex(g => g.id === gymId);
    if (idx !== -1) {
      this.state.gyms[idx] = { ...this.state.gyms[idx], ...updates };
      this.saveState(this.state);
      return this.state.gyms[idx];
    }
    return undefined;
  }

  getAllGyms(): Gym[] {
    return this.state.gyms;
  }

  createGym(gymData: Omit<Gym, 'id' | 'created_at' | 'is_active'>): Gym {
    const newGym: Gym = {
      ...gymData,
      id: `gym-${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const newSettings: GymSettings = {
      id: `set-${Date.now()}`,
      gym_id: newGym.id,
      invoice_prefix: gymData.slug.substring(0, 3).toUpperCase(),
      invoice_next_number: 1,
      currency: 'INR',
      tax_rate_percent: 18,
      is_tax_inclusive: false,
      attendance_qr_refresh_seconds: 60,
      allow_member_portal_renewals: true,
      max_freeze_days_per_year: 30,
      latitude: 19.0596,
      longitude: 72.8295,
      geofence_radius_meters: 100,
      enable_gps_attendance: true,
    };

    const newBranding: GymBranding = {
      id: `brand-${Date.now()}`,
      gym_id: newGym.id,
      primary_color: '#10B981',
      accent_color: '#059669',
    };

    this.state.gyms.push(newGym);
    this.state.settings[newGym.id] = newSettings;
    this.state.branding[newGym.id] = newBranding;

    // Default starter plan
    this.state.membershipPlans.push({
      id: `plan-${Date.now()}`,
      gym_id: newGym.id,
      name: 'General Monthly Plan',
      duration_days: 30,
      price: 2000,
      admission_fee: 500,
      is_pt_included: false,
      pt_sessions_count: 0,
      is_active: true,
    });

    this.saveState(this.state);
    return newGym;
  }

  getSettings(gymId: string): GymSettings {
    return this.state.settings[gymId] || INITIAL_SETTINGS;
  }

  updateSettings(gymId: string, updates: Partial<GymSettings>): GymSettings {
    const current = this.getSettings(gymId);
    const updated = { ...current, ...updates };
    this.state.settings[gymId] = updated;
    this.saveState(this.state);
    return updated;
  }

  getBranding(gymId: string): GymBranding {
    return this.state.branding[gymId] || INITIAL_BRANDING;
  }

  updateBranding(gymId: string, updates: Partial<GymBranding>): GymBranding {
    const current = this.getBranding(gymId);
    const updated = { ...current, ...updates };
    this.state.branding[gymId] = updated;
    this.saveState(this.state);
    return updated;
  }

  // --- Members ---
  getMembers(gymId: string): Member[] {
    return this.state.members
      .filter(m => m.gym_id === gymId)
      .map(m => {
        const sub = this.state.subscriptions.find(s => s.member_id === m.id && s.status !== 'inactive');
        const plan = sub ? this.state.membershipPlans.find(p => p.id === sub.plan_id) : undefined;
        const trainer = m.assigned_trainer_id ? this.state.trainers.find(t => t.id === m.assigned_trainer_id) : undefined;
        return {
          ...m,
          assigned_trainer: trainer,
          current_subscription: sub ? { ...sub, plan } : undefined,
        };
      });
  }

  getMember(id: string): Member | undefined {
    const member = this.state.members.find(m => m.id === id);
    if (!member) return undefined;
    const sub = this.state.subscriptions.find(s => s.member_id === member.id && s.status !== 'inactive');
    const plan = sub ? this.state.membershipPlans.find(p => p.id === sub.plan_id) : undefined;
    const trainer = member.assigned_trainer_id ? this.state.trainers.find(t => t.id === member.assigned_trainer_id) : undefined;
    return {
      ...member,
      assigned_trainer: trainer,
      current_subscription: sub ? { ...sub, plan } : undefined,
    };
  }

  createMember(gymId: string, memberData: Omit<Member, 'id' | 'gym_id' | 'created_at' | 'status' | 'member_code'>, planId?: string): Member {
    const count = this.state.members.filter(m => m.gym_id === gymId).length + 1;
    const memberCode = `M-${String(count).padStart(5, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
      gym_id: gymId,
      member_code: memberCode,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    this.state.members.unshift(newMember);

    if (planId) {
      const plan = this.state.membershipPlans.find(p => p.id === planId);
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.duration_days);

        const newSub: MemberSubscription = {
          id: `sub-${Date.now()}`,
          gym_id: gymId,
          member_id: newMember.id,
          plan_id: plan.id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_frozen: false,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        this.state.subscriptions.unshift(newSub);
      }
    }

    this.saveState(this.state);
    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>): Member | undefined {
    const idx = this.state.members.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.state.members[idx] = { ...this.state.members[idx], ...updates };
    this.saveState(this.state);
    return this.state.members[idx];
  }

  // --- Membership Plans ---
  getPlans(gymId: string): MembershipPlan[] {
    return this.state.membershipPlans.filter(p => p.gym_id === gymId && p.is_active);
  }

  createPlan(gymId: string, planData: Omit<MembershipPlan, 'id' | 'gym_id' | 'is_active'>): MembershipPlan {
    const newPlan: MembershipPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      gym_id: gymId,
      is_active: true,
    };
    this.state.membershipPlans.push(newPlan);
    this.saveState(this.state);
    return newPlan;
  }

  // --- Attendance & Anti-Duplicate Check-in ---
  getTodayAttendance(gymId: string): AttendanceRecord[] {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.state.attendance
      .filter(a => a.gym_id === gymId && a.check_in_time.startsWith(todayStr))
      .map(a => ({
        ...a,
        member: this.state.members.find(m => m.id === a.member_id),
      }))
      .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
  }

  checkInMember(gymId: string, memberId: string, method: 'gps_geofence' | 'qr_scan' | 'reception_manual' = 'reception_manual', staffName = 'Front Desk'): { success: boolean; message: string; record?: AttendanceRecord } {
    const member = this.state.members.find(m => m.id === memberId && m.gym_id === gymId);
    if (!member) {
      return { success: false, message: 'Member not found or does not belong to this facility.' };
    }

    // Anti-duplicate rule: Lockout within 60 minutes
    const lastRecord = this.state.attendance
      .filter(a => a.gym_id === gymId && a.member_id === memberId)
      .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())[0];

    if (lastRecord) {
      const diffMinutes = (Date.now() - new Date(lastRecord.check_in_time).getTime()) / (1000 * 60);
      if (diffMinutes < 60) {
        return {
          success: false,
          message: `Duplicate prevented: ${member.full_name} was already checked in ${Math.round(diffMinutes)} minutes ago.`,
        };
      }
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      gym_id: gymId,
      member_id: memberId,
      check_in_time: new Date().toISOString(),
      method,
      verified_by_name: staffName,
      member,
    };

    this.state.attendance.unshift(newRecord);
    this.saveState(this.state);
    return { success: true, message: `Check-in recorded successfully for ${member.full_name}`, record: newRecord };
  }

  checkInMemberViaGps(
    gymId: string,
    memberId: string,
    userLatitude: number,
    userLongitude: number
  ): { success: boolean; message: string; distanceMeters?: number; record?: AttendanceRecord } {
    const settings = this.getSettings(gymId);
    const member = this.state.members.find(m => m.id === memberId && m.gym_id === gymId);
    if (!member) {
      return { success: false, message: 'Member not found or unauthorized.' };
    }

    if (!settings.enable_gps_attendance) {
      return { success: false, message: 'GPS attendance is currently disabled by gym administration.' };
    }

    const distance = calculateDistanceMeters(
      userLatitude,
      userLongitude,
      settings.latitude,
      settings.longitude
    );

    if (!isWithinGeofence(distance, settings.geofence_radius_meters)) {
      return {
        success: false,
        distanceMeters: distance,
        message: `Outside gym perimeter (${formatDistance(distance)} away). Auto-checkin requires being within ${settings.geofence_radius_meters}m of the facility.`,
      };
    }

    const checkInRes = this.checkInMember(gymId, memberId, 'gps_geofence', 'GPS Auto-Geofence');
    return {
      ...checkInRes,
      distanceMeters: distance,
    };
  }

  // --- Payments & Financial ERP ---
  getPayments(gymId: string): Payment[] {
    return this.state.payments
      .filter(p => p.gym_id === gymId)
      .map(p => ({
        ...p,
        member: this.state.members.find(m => m.id === p.member_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  recordPayment(gymId: string, data: {
    memberId: string;
    subscriptionId?: string;
    amountPaid: number;
    paymentMethod: Payment['payment_method'];
    paymentType: Payment['payment_type'];
    discountAmount?: number;
    balanceDue?: number;
    dueDate?: string;
    reference?: string;
    notes?: string;
  }): Payment {
    const settings = this.getSettings(gymId);
    const invNumber = `${settings.invoice_prefix}-${new Date().getFullYear()}-${String(settings.invoice_next_number).padStart(4, '0')}`;
    this.updateSettings(gymId, { invoice_next_number: settings.invoice_next_number + 1 });

    const gst = calculateGST(data.amountPaid, settings.tax_rate_percent, settings.is_tax_inclusive);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      gym_id: gymId,
      member_id: data.memberId,
      subscription_id: data.subscriptionId,
      invoice_number: invNumber,
      payment_type: data.paymentType,
      payment_method: data.paymentMethod,
      amount_paid: data.amountPaid,
      tax_amount: gst.totalTax,
      discount_amount: data.discountAmount || 0,
      balance_due: data.balanceDue || 0,
      due_date: data.dueDate,
      transaction_reference: data.reference,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.state.payments.unshift(newPayment);
    this.saveState(this.state);
    return newPayment;
  }

  // --- Expenses ---
  getExpenses(gymId: string): Expense[] {
    return this.state.expenses
      .filter(e => e.gym_id === gymId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  recordExpense(gymId: string, data: Omit<Expense, 'id' | 'gym_id' | 'created_at'>): Expense {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      gym_id: gymId,
      created_at: new Date().toISOString(),
    };
    this.state.expenses.unshift(newExpense);
    this.saveState(this.state);
    return newExpense;
  }

  // --- Leads CRM ---
  getLeads(gymId: string): Lead[] {
    return this.state.leads
      .filter(l => l.gym_id === gymId)
      .map(l => ({
        ...l,
        interested_plan: l.interested_plan_id ? this.state.membershipPlans.find(p => p.id === l.interested_plan_id) : undefined,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createLead(gymId: string, leadData: Omit<Lead, 'id' | 'gym_id' | 'created_at'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      gym_id: gymId,
      created_at: new Date().toISOString(),
    };
    this.state.leads.unshift(newLead);
    this.saveState(this.state);
    return newLead;
  }

  updateLeadStatus(leadId: string, status: Lead['status']): Lead | undefined {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return undefined;
    lead.status = status;
    this.saveState(this.state);
    return lead;
  }

  // --- Trainers & Staff ---
  getStaff(gymId: string): GymStaff[] {
    return this.state.staff.filter(s => s.gym_id === gymId);
  }

  getTrainers(gymId: string): Trainer[] {
    return this.state.trainers.filter(t => t.gym_id === gymId).map(t => ({
      ...t,
      staff: this.state.staff.find(s => s.id === t.staff_id),
    }));
  }

  // --- Workouts & Diets ---
  getWorkouts(gymId: string): WorkoutPlan[] {
    return this.state.workouts.filter(w => w.gym_id === gymId);
  }

  getDiets(gymId: string): DietPlan[] {
    return this.state.diets.filter(d => d.gym_id === gymId);
  }
}

export const gymStore = new GymStore();
