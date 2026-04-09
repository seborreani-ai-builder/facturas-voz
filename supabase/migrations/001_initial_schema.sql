-- VozFactura: Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (company data, one per user)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  nif text not null,
  address text,
  city text,
  postal_code text,
  province text,
  phone text,
  email text,
  bank_iban text,
  logo_url text,
  default_iva integer not null default 21,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- DOCUMENTS (invoices and quotes)
-- ============================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('invoice', 'quote')),
  document_number text not null,
  client_name text,
  client_email text,
  client_nif text,
  client_address text,
  subtotal decimal(10,2) not null default 0,
  iva_percent integer not null default 21,
  iva_amount decimal(10,2) not null default 0,
  total decimal(10,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'paid', 'rejected')),
  valid_until date,
  notes text,
  original_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Unique document number per user per type
create unique index documents_user_type_number_idx
  on public.documents(user_id, document_type, document_number);

-- ============================================
-- DOCUMENT ITEMS (line items)
-- ============================================
create table public.document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  description text not null,
  quantity decimal(10,2) not null default 1,
  unit_price decimal(10,2) not null default 0,
  amount decimal(10,2) not null default 0
);

alter table public.document_items enable row level security;

create policy "Users can view own document items"
  on public.document_items for select
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_items.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert own document items"
  on public.document_items for insert
  with check (
    exists (
      select 1 from public.documents
      where documents.id = document_items.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can update own document items"
  on public.document_items for update
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_items.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can delete own document items"
  on public.document_items for delete
  using (
    exists (
      select 1 from public.documents
      where documents.id = document_items.document_id
      and documents.user_id = auth.uid()
    )
  );

-- ============================================
-- CONTACTS (outreach)
-- ============================================
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text,
  province text,
  city text,
  phone text,
  email text,
  website text,
  google_maps_url text,
  rating decimal(2,1),
  source text not null default 'google_maps',
  contacted boolean not null default false,
  contacted_at timestamptz,
  outreach_email_text text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- Contacts are accessible to all authenticated users (shared resource)
create policy "Authenticated users can view contacts"
  on public.contacts for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert contacts"
  on public.contacts for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update contacts"
  on public.contacts for update
  using (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-generate document number
create or replace function public.generate_document_number(
  p_user_id uuid,
  p_document_type text
)
returns text
language plpgsql
security definer
as $$
declare
  prefix text;
  current_year text;
  next_num integer;
begin
  prefix := case p_document_type
    when 'invoice' then 'FAC'
    when 'quote' then 'PRE'
  end;

  current_year := extract(year from now())::text;

  select coalesce(max(
    substring(document_number from prefix || '-' || current_year || '-(\d+)')::integer
  ), 0) + 1
  into next_num
  from public.documents
  where user_id = p_user_id
    and document_type = p_document_type
    and document_number like prefix || '-' || current_year || '-%';

  return prefix || '-' || current_year || '-' || lpad(next_num::text, 3, '0');
end;
$$;

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.handle_updated_at();
