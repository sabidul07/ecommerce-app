-- ============================================================
-- ATELIER — STRICT ADMIN ACCESS SCHEMA UPDATE
-- Run this in the Supabase SQL Editor
-- ============================================================

-- This trigger ensures that ONLY the specific email can ever have is_admin = true
-- Even if someone manually tries to change it in the dashboard for another user, 
-- this trigger will block the update.

CREATE OR REPLACE FUNCTION public.check_admin_privilege()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the email of the user being updated
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  -- If is_admin is being set to true, verify the email
  IF NEW.is_admin = true THEN
    IF user_email != 'sabidulansari58@gmail.com' THEN
      RAISE EXCEPTION 'Administrative privileges are restricted to authorized accounts only.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to the profiles table
DROP TRIGGER IF EXISTS tr_restrict_admin_access ON public.profiles;
CREATE TRIGGER tr_restrict_admin_access
  BEFORE INSERT OR UPDATE OF is_admin ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_privilege();

-- Also, let's reset any other admins just in case
UPDATE public.profiles 
SET is_admin = false 
WHERE id IN (
  SELECT id FROM auth.users WHERE email != 'sabidulansari58@gmail.com'
);

-- Final check: Ensure the authorized user IS an admin
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'sabidulansari58@gmail.com'
);

-- ============================================================
-- ATELIER — ADMIN RLS POLICIES
-- ============================================================

-- Orders: Admin view all
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
CREATE POLICY "Admin view all orders"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND is_admin = true)
);

-- Order Items: Admin view all
DROP POLICY IF EXISTS "Admin view all order items" ON public.order_items;
CREATE POLICY "Admin view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND is_admin = true)
);

-- Payments: Admin view all
DROP POLICY IF EXISTS "Admin view all payments" ON public.payments;
CREATE POLICY "Admin view all payments"
ON public.payments FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND is_admin = true)
);
