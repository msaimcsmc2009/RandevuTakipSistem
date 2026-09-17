-- Enforce one business per owner at the database level. The app's
-- getOwnerBusiness() uses .maybeSingle(), which throws if a user ever ends
-- up with more than one business row (e.g. a double form submit) — this
-- constraint makes that state impossible instead of failing at read time.
alter table public.businesses
  add constraint businesses_owner_id_unique unique (owner_id);
