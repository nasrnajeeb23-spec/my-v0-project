-- إنشاء جدول الموارد البشرية (الأفراد)
CREATE TABLE IF NOT EXISTS public.personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  position TEXT NOT NULL,
  unit TEXT NOT NULL,
  military_id TEXT UNIQUE NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  place_of_birth TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  blood_type TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  email TEXT,
  enlistment_date DATE NOT NULL,
  -- إزالة العمود المولد service_years لأنه يستخدم CURRENT_DATE (non-immutable)
  -- سيتم حسابه في التطبيق بدلاً من قاعدة البيانات
  service_years INTEGER,
  status TEXT NOT NULL CHECK (status IN ('active', 'on_leave', 'retired', 'transferred', 'deceased')),
  photo_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الحضور والانصراف
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'on_leave', 'sick_leave', 'official_mission')),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(personnel_id, date)
);

-- إنشاء جدول الإجازات
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'emergency', 'maternity', 'study', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  -- تحويل days_count إلى عمود عادي بدلاً من مولد
  days_count INTEGER,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approval_date DATE,
  rejection_reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.personnel(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول التقييمات
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL,
  evaluation_period TEXT NOT NULL,
  performance_score INTEGER CHECK (performance_score BETWEEN 1 AND 100),
  discipline_score INTEGER CHECK (discipline_score BETWEEN 1 AND 100),
  leadership_score INTEGER CHECK (leadership_score BETWEEN 1 AND 100),
  teamwork_score INTEGER CHECK (teamwork_score BETWEEN 1 AND 100),
  -- تحويل overall_score إلى عمود عادي بدلاً من مولد
  overall_score INTEGER,
  strengths TEXT,
  weaknesses TEXT,
  recommendations TEXT,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول التدريبات والدورات
CREATE TABLE IF NOT EXISTS public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  training_name TEXT NOT NULL,
  training_type TEXT NOT NULL CHECK (training_type IN ('military', 'technical', 'administrative', 'leadership', 'specialized')),
  institution TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  -- تحويل duration_days إلى عمود عادي بدلاً من مولد
  duration_days INTEGER,
  certificate_number TEXT,
  grade TEXT,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الترقيات
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  from_rank TEXT NOT NULL,
  to_rank TEXT NOT NULL,
  promotion_date DATE NOT NULL,
  promotion_order_number TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول الجزاءات والمكافآت
CREATE TABLE IF NOT EXISTS public.disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('reward', 'warning', 'penalty', 'suspension', 'dismissal')),
  action_date DATE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  order_number TEXT,
  duration_days INTEGER,
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول السجل الطبي
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('checkup', 'illness', 'injury', 'surgery', 'vaccination', 'fitness_test')),
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  doctor_name TEXT,
  hospital TEXT,
  fitness_status TEXT CHECK (fitness_status IN ('fit', 'limited_duty', 'unfit', 'under_treatment')),
  next_checkup_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول المعدات المخصصة
CREATE TABLE IF NOT EXISTS public.equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  serial_number TEXT,
  assignment_date DATE NOT NULL,
  return_date DATE,
  condition_on_assignment TEXT CHECK (condition_on_assignment IN ('new', 'good', 'fair', 'poor')),
  condition_on_return TEXT CHECK (condition_on_return IN ('new', 'good', 'fair', 'poor', 'damaged', 'lost')),
  status TEXT NOT NULL CHECK (status IN ('assigned', 'returned', 'lost', 'damaged')),
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول تاريخ الخدمة
CREATE TABLE IF NOT EXISTS public.service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('enlistment', 'transfer', 'promotion', 'deployment', 'mission', 'leave', 'return', 'retirement')),
  event_date DATE NOT NULL,
  from_unit TEXT,
  to_unit TEXT,
  description TEXT NOT NULL,
  order_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة دوال مساعدة لحساب القيم المحسوبة
-- دالة لحساب سنوات الخدمة
CREATE OR REPLACE FUNCTION calculate_service_years(enlistment_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, enlistment_date));
END;
$$ LANGUAGE plpgsql STABLE;

-- دالة لحساب عدد أيام الإجازة
CREATE OR REPLACE FUNCTION calculate_days_count(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN end_date - start_date + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- دالة لحساب المعدل الإجمالي
CREATE OR REPLACE FUNCTION calculate_overall_score(
  performance_score INTEGER,
  discipline_score INTEGER,
  leadership_score INTEGER,
  teamwork_score INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (performance_score + discipline_score + leadership_score + teamwork_score) / 4;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- تفعيل Row Level Security
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_history ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان (يمكن للجميع القراءة، فقط المصرح لهم بالكتابة)
CREATE POLICY "personnel_select_all" ON public.personnel FOR SELECT USING (true);
CREATE POLICY "personnel_insert_auth" ON public.personnel FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('finance_officer', 'commander'))
);
CREATE POLICY "personnel_update_auth" ON public.personnel FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('finance_officer', 'commander'))
);
CREATE POLICY "personnel_delete_auth" ON public.personnel FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'finance_officer')
);

-- تطبيق نفس السياسات على باقي الجداول
CREATE POLICY "attendance_select_all" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "leaves_select_all" ON public.leaves FOR SELECT USING (true);
CREATE POLICY "evaluations_select_all" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "trainings_select_all" ON public.trainings FOR SELECT USING (true);
CREATE POLICY "promotions_select_all" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "disciplinary_actions_select_all" ON public.disciplinary_actions FOR SELECT USING (true);
CREATE POLICY "medical_records_select_all" ON public.medical_records FOR SELECT USING (true);
CREATE POLICY "equipment_assignments_select_all" ON public.equipment_assignments FOR SELECT USING (true);
CREATE POLICY "service_history_select_all" ON public.service_history FOR SELECT USING (true);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_personnel_status ON public.personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_unit ON public.personnel(unit);
CREATE INDEX IF NOT EXISTS idx_attendance_personnel_id ON public.attendance(personnel_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_leaves_personnel_id ON public.leaves(personnel_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_personnel_id ON public.evaluations(personnel_id);
CREATE INDEX IF NOT EXISTS idx_trainings_personnel_id ON public.trainings(personnel_id);
CREATE INDEX IF NOT EXISTS idx_promotions_personnel_id ON public.promotions(personnel_id);
CREATE INDEX IF NOT EXISTS idx_disciplinary_actions_personnel_id ON public.disciplinary_actions(personnel_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_personnel_id ON public.medical_records(personnel_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_personnel_id ON public.equipment_assignments(personnel_id);
CREATE INDEX IF NOT EXISTS idx_service_history_personnel_id ON public.service_history(personnel_id);
