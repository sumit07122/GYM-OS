-- Migration 0004: Trainers, Workouts, Diets, and Member Progress
-- Engine: PostgreSQL 17

-- 1. Trainers Table
CREATE TABLE IF NOT EXISTS public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL UNIQUE REFERENCES public.gym_staff(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  specialization TEXT[] DEFAULT '{}',
  pt_commission_percent NUMERIC(5,2) DEFAULT 0.00,
  max_clients INT DEFAULT 20,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key constraint to members table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_members_assigned_trainer'
  ) THEN
    ALTER TABLE public.members
    ADD CONSTRAINT fk_members_assigned_trainer
    FOREIGN KEY (assigned_trainer_id) REFERENCES public.trainers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Workout Plans Table
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  goal VARCHAR(100),
  difficulty_level VARCHAR(50) DEFAULT 'Intermediate',
  notes TEXT,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Workout Exercises Table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL, -- Monday, Tuesday, etc.
  exercise_name VARCHAR(150) NOT NULL,
  muscle_group VARCHAR(100) NOT NULL,
  sets INT NOT NULL DEFAULT 3,
  reps VARCHAR(50) NOT NULL DEFAULT '10-12',
  target_weight_kg NUMERIC(6,2),
  rest_seconds INT DEFAULT 60,
  demonstration_url TEXT,
  order_index INT NOT NULL DEFAULT 0
);

-- 4. Diet Plans Table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  daily_calories INT NOT NULL DEFAULT 2000,
  protein_grams INT NOT NULL DEFAULT 150,
  carbs_grams INT NOT NULL DEFAULT 200,
  fats_grams INT NOT NULL DEFAULT 60,
  water_liters NUMERIC(3,1) DEFAULT 3.5,
  notes TEXT,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Diet Meals Table
CREATE TABLE IF NOT EXISTS public.diet_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  meal_name VARCHAR(100) NOT NULL, -- Breakfast, Mid-Morning, Lunch, Snack, Dinner
  time_of_day VARCHAR(20),
  food_items TEXT NOT NULL,
  calories INT DEFAULT 0,
  protein_grams INT DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0
);

-- 6. Member Progress Measurements Table
CREATE TABLE IF NOT EXISTS public.member_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL,
  body_fat_percent NUMERIC(4,1),
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  biceps_cm NUMERIC(5,1),
  thighs_cm NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_measurements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "trainers_select" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "trainers_mutate" ON public.trainers FOR ALL USING (public.is_gym_admin(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "workouts_select" ON public.workout_plans FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);
CREATE POLICY "workouts_mutate" ON public.workout_plans FOR ALL USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "exercises_select" ON public.workout_exercises FOR SELECT USING (true);
CREATE POLICY "exercises_mutate" ON public.workout_exercises FOR ALL USING (true);

CREATE POLICY "diets_select" ON public.diet_plans FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);
CREATE POLICY "diets_mutate" ON public.diet_plans FOR ALL USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());

CREATE POLICY "meals_select" ON public.diet_meals FOR SELECT USING (true);
CREATE POLICY "meals_mutate" ON public.diet_meals FOR ALL USING (true);

CREATE POLICY "measurements_select" ON public.member_measurements FOR SELECT USING (
  public.is_gym_staff(gym_id) OR EXISTS (SELECT 1 FROM public.members WHERE id = member_id AND user_id = auth.uid()) OR public.is_platform_super_admin()
);
CREATE POLICY "measurements_mutate" ON public.member_measurements FOR ALL USING (public.is_gym_staff(gym_id) OR public.is_platform_super_admin());
