-- إضافة جدول الألوية والوحدات
create table if not exists public.brigades (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  commander_name text,
  location text,
  phone text,
  email text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.brigades enable row level security;

create policy "brigades_select_all"
  on public.brigades for select
  using (true);

create policy "brigades_insert_admin"
  on public.brigades for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "brigades_update_admin"
  on public.brigades for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إضافة عمود brigade_id للجداول الموجودة
alter table public.profiles add column if not exists brigade_id uuid references public.brigades(id) on delete set null;
alter table public.allocations add column if not exists brigade_id uuid references public.brigades(id) on delete cascade;
alter table public.orders add column if not exists brigade_id uuid references public.brigades(id) on delete cascade;

-- إنشاء جدول الديون السابقة وخطط السداد
create table if not exists public.previous_debts (
  id uuid primary key default gen_random_uuid(),
  brigade_id uuid references public.brigades(id) on delete cascade,
  debt_number text unique not null,
  creditor text not null,
  original_amount numeric not null,
  remaining_amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  debt_date date not null,
  due_date date,
  description text not null,
  status text not null check (status in ('active', 'paid', 'overdue', 'cancelled')),
  priority text check (priority in ('high', 'medium', 'low')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.previous_debts enable row level security;

create policy "previous_debts_select_all"
  on public.previous_debts for select
  using (true);

create policy "previous_debts_insert_finance"
  on public.previous_debts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "previous_debts_update_finance"
  on public.previous_debts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء جدول خطط السداد
create table if not exists public.repayment_plans (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references public.previous_debts(id) on delete cascade,
  plan_number text unique not null,
  total_installments integer not null,
  installment_amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  start_date date not null,
  frequency text not null check (frequency in ('monthly', 'quarterly', 'semi_annual', 'annual')),
  status text not null check (status in ('active', 'completed', 'suspended', 'cancelled')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.repayment_plans enable row level security;

create policy "repayment_plans_select_all"
  on public.repayment_plans for select
  using (true);

create policy "repayment_plans_insert_finance"
  on public.repayment_plans for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "repayment_plans_update_finance"
  on public.repayment_plans for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء جدول أقساط السداد
create table if not exists public.repayment_installments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.repayment_plans(id) on delete cascade,
  installment_number integer not null,
  amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  due_date date not null,
  paid_date date,
  status text not null check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  payment_reference text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.repayment_installments enable row level security;

create policy "repayment_installments_select_all"
  on public.repayment_installments for select
  using (true);

create policy "repayment_installments_update_finance"
  on public.repayment_installments for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء الفهارس
create index if not exists idx_brigades_code on public.brigades(code);
create index if not exists idx_profiles_brigade_id on public.profiles(brigade_id);
create index if not exists idx_allocations_brigade_id on public.allocations(brigade_id);
create index if not exists idx_orders_brigade_id on public.orders(brigade_id);
create index if not exists idx_previous_debts_brigade_id on public.previous_debts(brigade_id);
create index if not exists idx_previous_debts_status on public.previous_debts(status);
create index if not exists idx_repayment_plans_debt_id on public.repayment_plans(debt_id);
create index if not exists idx_repayment_installments_plan_id on public.repayment_installments(plan_id);
create index if not exists idx_repayment_installments_status on public.repayment_installments(status);

-- إضافة بيانات تجريبية للألوية
insert into public.brigades (name, code, commander_name, location, is_active) values
  ('اللواء الأول', 'BRG-001', 'العقيد أحمد محمد', 'صنعاء', true),
  ('اللواء الثاني', 'BRG-002', 'العقيد خالد علي', 'عدن', true),
  ('اللواء الثالث', 'BRG-003', 'العقيد محمد سعيد', 'تعز', true)
on conflict (code) do nothing;
