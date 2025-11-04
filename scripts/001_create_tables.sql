-- إنشاء جدول المستخدمين (profiles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('finance_officer', 'commander', 'auditor')),
  unit text not null,
  rank text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- سياسات الأمان للمستخدمين
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- إنشاء جدول المخصصات
create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  allocation_number text unique not null,
  source text not null,
  amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  received_date date not null,
  category text not null,
  status text not null check (status in ('active', 'depleted', 'expired')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.allocations enable row level security;

-- سياسات الأمان للمخصصات
create policy "allocations_select_all"
  on public.allocations for select
  using (true);

create policy "allocations_insert_finance"
  on public.allocations for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "allocations_update_finance"
  on public.allocations for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "allocations_delete_finance"
  on public.allocations for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء جدول الأوامر
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  order_type text not null check (order_type in ('written', 'verbal', 'phone')),
  beneficiary text not null,
  amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  purpose text not null,
  allocation_id uuid references public.allocations(id) on delete set null,
  status text not null check (status in ('pending', 'approved', 'rejected', 'paid', 'debt')),
  order_date date not null,
  payment_date date,
  attachment_url text,
  has_attachment boolean default false,
  notes text,
  rejection_reason text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- سياسات الأمان للأوامر
create policy "orders_select_all"
  on public.orders for select
  using (true);

create policy "orders_insert_auth"
  on public.orders for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('finance_officer', 'commander')
    )
  );

create policy "orders_update_auth"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('finance_officer', 'commander')
    )
  );

create policy "orders_delete_finance"
  on public.orders for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء جدول الديون
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  amount numeric not null,
  currency text not null check (currency in ('YER', 'SAR', 'USD', 'EUR')),
  allocation_id uuid references public.allocations(id) on delete set null,
  status text not null check (status in ('pending', 'paid')),
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

alter table public.debts enable row level security;

-- سياسات الأمان للديون
create policy "debts_select_all"
  on public.debts for select
  using (true);

create policy "debts_insert_finance"
  on public.debts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

create policy "debts_update_finance"
  on public.debts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'finance_officer'
    )
  );

-- إنشاء جدول سجل التدقيق
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

-- سياسات الأمان لسجل التدقيق
create policy "audit_logs_select_all"
  on public.audit_logs for select
  using (true);

create policy "audit_logs_insert_auth"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- إنشاء جدول الإشعارات
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'warning', 'error', 'success')),
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- سياسات الأمان للإشعارات
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_insert_all"
  on public.notifications for insert
  with check (true);

-- إنشاء الفهارس لتحسين الأداء
create index if not exists idx_allocations_status on public.allocations(status);
create index if not exists idx_allocations_created_by on public.allocations(created_by);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_allocation_id on public.orders(allocation_id);
create index if not exists idx_orders_created_by on public.orders(created_by);
create index if not exists idx_debts_status on public.debts(status);
create index if not exists idx_debts_order_id on public.debts(order_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_entity_type on public.audit_logs(entity_type);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
