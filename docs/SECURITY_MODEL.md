# GymOS — Security Model & Multi-Tenant Defense Architecture

**Product:** GymOS Multi-Tenant Gym Management ERP  
**Document Version:** 1.0.0 (Phase 0 Baseline)  

---

## 1. Threat Modeling & Core Security Objectives

As a multi-tenant ERP system handling financial records, health information, and staff salaries for independent gyms, GymOS must adhere to strict threat boundaries:

1. **Cross-Tenant Breach (Critical Severity):** A user from Gym A (e.g., owner, trainer, receptionist) must never access, view, or mutate data belonging to Gym B.
2. **Privilege Escalation:** A gym receptionist or member must not be able to elevate their privileges to `gym_owner` or `platform_super_admin`.
3. **Direct Object Reference (IDOR):** Requesting `/api/members/UUID` or querying PostgREST directly must enforce tenant scope regardless of parameters passed.
4. **Financial Record Tampering:** Historical payment receipts and audit logs must be immutable.
5. **Secret Exposure:** Client applications must never receive service-role credentials, Razorpay secret keys, or WhatsApp API tokens.

---

## 2. Row Level Security (RLS) Architecture

Every tenant table in PostgreSQL has RLS explicitly enabled:
```sql
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

### 2.1 Standard Tenant Access Policy Pattern

```sql
-- Read Policy for Staff & Members
CREATE POLICY "gym_members_select_policy"
ON public.members
FOR SELECT
USING (
  -- Gym staff can view members of their own gym
  public.is_gym_staff(gym_id)
  -- Or individual member viewing their own record
  OR (user_id = auth.uid())
  -- Or platform super admin
  OR public.is_platform_super_admin()
);

-- Mutation Policy for Authorized Staff
CREATE POLICY "gym_members_insert_policy"
ON public.members
FOR INSERT
WITH CHECK (
  public.is_gym_staff(gym_id)
);

CREATE POLICY "gym_members_update_policy"
ON public.members
FOR UPDATE
USING (
  public.is_gym_staff(gym_id)
  OR (user_id = auth.uid())
)
WITH CHECK (
  public.is_gym_staff(gym_id)
  OR (user_id = auth.uid())
);
```

### 2.2 Financial Transactions Immutability
To protect financial integrity:
- `payments` table allows `INSERT` and `SELECT`.
- `UPDATE` and `DELETE` on `payments` are strictly prohibited via RLS policies and database triggers.
- Refunds and adjustments must be inserted as distinct correction records (`payment_type = 'refund'`).

---

## 3. Secure Function Design (SECURITY DEFINER)

All database RPCs and helper functions executed with elevated privileges must follow PostgreSQL security best practices:
1. **Explicit Search Path:** Always define `SET search_path = public, pg_temp` to prevent schema search-path hijacking attacks.
2. **Explicit Parameter Validation:** Verify caller identity via `auth.uid()` at the start of every function body.
3. **Revoke Public Execution:** Revoke default execute permissions from `PUBLIC` and grant only to `authenticated`.

Example Secure RPC:
```sql
CREATE OR REPLACE FUNCTION public.record_attendance_checkin(
  p_gym_id UUID,
  p_member_id UUID,
  p_method attendance_method
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_last_checkin TIMESTAMPTZ;
  v_staff_id UUID;
  v_new_record_id UUID;
BEGIN
  -- 1. Authorization: Verify caller is active staff of this gym OR the member themselves
  IF NOT (public.is_gym_staff(p_gym_id) OR EXISTS (
    SELECT 1 FROM public.members WHERE id = p_member_id AND user_id = auth.uid() AND gym_id = p_gym_id
  )) THEN
    RAISE EXCEPTION 'Unauthorized attendance registration for gym %', p_gym_id;
  END IF;

  -- 2. Anti-Duplicate Check: Prevent check-ins within 60 minutes
  SELECT check_in_time INTO v_last_checkin
  FROM public.attendance_records
  WHERE gym_id = p_gym_id AND member_id = p_member_id
  ORDER BY check_in_time DESC
  LIMIT 1;

  IF v_last_checkin IS NOT NULL AND (now() - v_last_checkin) < INTERVAL '60 minutes' THEN
    RAISE EXCEPTION 'Member already checked in recently at %', v_last_checkin;
  END IF;

  -- 3. Resolve Staff Verifier
  SELECT id INTO v_staff_id FROM public.gym_staff
  WHERE gym_id = p_gym_id AND user_id = auth.uid();

  -- 4. Insert Record
  INSERT INTO public.attendance_records (gym_id, member_id, method, verified_by_staff_id)
  VALUES (p_gym_id, p_member_id, p_method, v_staff_id)
  RETURNING id INTO v_new_record_id;

  RETURN jsonb_build_object('success', true, 'record_id', v_new_record_id);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.record_attendance_checkin(UUID, UUID, attendance_method) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_attendance_checkin(UUID, UUID, attendance_method) TO authenticated;
```

---

## 4. Cross-Tenant Automated Verification Tests

As part of the continuous testing framework, dedicated automated test suites under `tests/security/` will systematically verify:
1. **Gym A Staff Querying Gym B:** Attempting `supabase.from('members').select().eq('gym_id', gymB_id)` returns zero rows.
2. **Gym A Staff Inserting into Gym B:** Attempting `supabase.from('payments').insert({ gym_id: gymB_id, ... })` fails with RLS violation error code `42501`.
3. **Member Attempting Staff Operations:** A regular member account attempting to insert membership plans or view other members' attendance fails with RLS rejection.
4. **Storage Cross-Tenant Boundary:** Attempting to download a document belonging to another gym's storage prefix returns `403 Forbidden`.
