-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO COMPLETA - Smart_Escola
-- Execute este script no SQL Editor do Supabase para verificar tudo
-- ============================================================================

-- 1. VERIFICAR TODAS AS TABELAS
SELECT 
  'TABELAS EXISTENTES' as verificacao,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. VERIFICAR CAMPOS DA TABELA classes
SELECT 
  'CAMPOS DA TABELA classes' as verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;

-- 3. VERIFICAR CAMPOS DA TABELA subjects
SELECT 
  'CAMPOS DA TABELA subjects' as verificacao,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subjects'
ORDER BY ordinal_position;

-- 4. VERIFICAR ENUM event_type
SELECT 
  'VALORES DO ENUM event_type' as verificacao,
  enumlabel as valor
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'event_type'
ORDER BY enumlabel;

-- 5. VERIFICAR ÍNDICES IMPORTANTES
SELECT 
  'ÍNDICES IMPORTANTES' as verificacao,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_classes%' OR
    indexname LIKE 'idx_subjects%' OR
    indexname LIKE 'idx_students%' OR
    indexname LIKE 'idx_teachers%' OR
    indexname LIKE 'idx_schedules%'
  )
ORDER BY tablename, indexname;

-- 6. VERIFICAR ROW LEVEL SECURITY (RLS)
SELECT 
  'RLS HABILITADO' as verificacao,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 7. CONTAR REGISTROS EM CADA TABELA (opcional - só se houver dados)
SELECT 
  'CONTAGEM DE REGISTROS' as verificacao,
  'classes' as tabela,
  COUNT(*) as total
FROM public.classes
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'subjects',
  COUNT(*)
FROM public.subjects
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'students',
  COUNT(*)
FROM public.students
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'teachers',
  COUNT(*)
FROM public.teachers
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'calendar_events',
  COUNT(*)
FROM public.calendar_events
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'schedules',
  COUNT(*)
FROM public.schedules
UNION ALL
SELECT 
  'CONTAGEM DE REGISTROS',
  'grades',
  COUNT(*)
FROM public.grades;

-- ============================================================================
-- RESULTADO ESPERADO:
-- 
-- 1. TABELAS EXISTENTES: 12 tabelas
--    - calendar_events
--    - classes (deve ter campos: level, room, teacher_id)
--    - enrollments
--    - grades
--    - grading_periods
--    - profiles
--    - schedules
--    - students
--    - subjects (deve ter campo: color)
--    - teacher_subjects
--    - teachers
--    - user_roles
--
-- 2. ENUM event_type: deve incluir 'event', 'holiday', 'exam', 'meeting', 'deadline', 'other'
--
-- 3. RLS: Todas as tabelas devem ter rowsecurity = true
--
-- ============================================================================

