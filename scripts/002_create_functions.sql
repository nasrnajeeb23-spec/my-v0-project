-- دالة لتحديث updated_at تلقائياً
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- إضافة المحفزات لتحديث updated_at
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists allocations_updated_at on public.allocations;
create trigger allocations_updated_at
  before update on public.allocations
  for each row
  execute function public.handle_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function public.handle_updated_at();

-- دالة لإنشاء إشعار للقائد عند إضافة أمر بدون مرفق
create or replace function public.notify_commander_missing_attachment()
returns trigger
language plpgsql
security definer
as $$
declare
  commander_id uuid;
  creator_name text;
begin
  -- إذا كان الأمر شفهي أو هاتفي وليس له مرفق
  if (new.order_type in ('verbal', 'phone') and new.has_attachment = false) then
    -- البحث عن القائد
    select id into commander_id
    from public.profiles
    where role = 'commander'
    limit 1;
    
    -- الحصول على اسم منشئ الأمر
    select full_name into creator_name
    from public.profiles
    where id = new.created_by;
    
    -- إنشاء إشعار للقائد
    if commander_id is not null then
      insert into public.notifications (user_id, title, message, type, link)
      values (
        commander_id,
        'أمر يحتاج إلى مرفق خطي',
        'الأمر رقم ' || new.order_number || ' من ' || coalesce(creator_name, 'غير معروف') || ' هو أمر ' || 
        case new.order_type 
          when 'verbal' then 'شفهي'
          when 'phone' then 'هاتفي'
        end || ' ويحتاج إلى أمر خطي مرفق.',
        'warning',
        '/orders'
      );
    end if;
  end if;
  
  return new;
end;
$$;

drop trigger if exists notify_missing_attachment on public.orders;
create trigger notify_missing_attachment
  after insert on public.orders
  for each row
  execute function public.notify_commander_missing_attachment();

-- دالة لإنشاء دين عند عدم توفر سيولة
create or replace function public.create_debt_if_needed()
returns trigger
language plpgsql
security definer
as $$
declare
  allocation_balance numeric;
  finance_officer_id uuid;
begin
  -- إذا تمت الموافقة على الأمر
  if (new.status = 'approved' and old.status = 'pending') then
    -- التحقق من رصيد المخصص
    if new.allocation_id is not null then
      select amount into allocation_balance
      from public.allocations
      where id = new.allocation_id;
      
      -- حساب المبلغ المصروف من هذا المخصص
      select coalesce(sum(amount), 0) into allocation_balance
      from public.orders
      where allocation_id = new.allocation_id
        and status in ('approved', 'paid')
        and id != new.id;
      
      -- الحصول على الرصيد المتبقي
      select amount - allocation_balance into allocation_balance
      from public.allocations
      where id = new.allocation_id;
      
      -- إذا لم يكن هناك رصيد كافٍ، إنشاء دين
      if allocation_balance < new.amount then
        insert into public.debts (order_id, amount, currency, allocation_id, status, notes)
        values (
          new.id,
          new.amount,
          new.currency,
          new.allocation_id,
          'pending',
          'تم إنشاء دين بسبب عدم توفر سيولة كافية في المخصص'
        );
        
        -- تحديث حالة الأمر إلى دين
        new.status = 'debt';
        
        -- إشعار المالية
        select id into finance_officer_id
        from public.profiles
        where role = 'finance_officer'
        limit 1;
        
        if finance_officer_id is not null then
          insert into public.notifications (user_id, title, message, type, link)
          values (
            finance_officer_id,
            'تم إنشاء دين',
            'الأمر رقم ' || new.order_number || ' تم تسجيله كدين بسبب عدم توفر سيولة كافية.',
            'warning',
            '/orders'
          );
        end if;
      end if;
    end if;
  end if;
  
  return new;
end;
$$;

drop trigger if exists create_debt_trigger on public.orders;
create trigger create_debt_trigger
  before update on public.orders
  for each row
  execute function public.create_debt_if_needed();
