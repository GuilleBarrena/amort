-- Allow 'income' as a valid entry type (nómina, ingresos recurrentes, etc.)
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_type_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_type_check CHECK (type IN ('amort', 'sub', 'income'));
