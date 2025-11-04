-- إدراج مستخدم تجريبي (يجب على المستخدم التسجيل أولاً)
-- هذا مثال فقط، سيتم إنشاء المستخدمين عبر واجهة التسجيل

-- إدراج بعض المخصصات التجريبية
insert into public.allocations (allocation_number, source, amount, currency, received_date, category, status, notes)
values
  ('ALLOC-2025-001', 'وزارة الدفاع', 5000000, 'YER', '2025-01-01', 'رواتب', 'active', 'مخصص رواتب الربع الأول'),
  ('ALLOC-2025-002', 'وزارة الدفاع', 2000000, 'YER', '2025-01-01', 'تشغيل', 'active', 'مخصص تشغيلي'),
  ('ALLOC-2025-003', 'وزارة الدفاع', 1000000, 'YER', '2025-01-01', 'صيانة', 'active', 'مخصص صيانة المعدات')
on conflict (allocation_number) do nothing;
