-- ============================================================================
-- VERIFICAÇÃO: Confirmar que os campos foram adicionados corretamente
-- ============================================================================
-- Execute este script para verificar se a migração foi aplicada com sucesso
-- ============================================================================

-- 1. Verificar campos adicionados na tabela classes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'classes' 
  AND column_name IN ('level', 'room', 'teacher_id')
ORDER BY column_name;

-- 2. Verificar campo color na tabela subjects
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'subjects' 
  AND column_name = 'color';

-- 3. Verificar se o valor 'event' foi adicionado ao enum event_type
SELECT 
    e.enumlabel AS enum_value,
    t.typname AS enum_name
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'event_type'
ORDER BY e.enumsortorder;

-- 4. Verificar índice criado para teacher_id em classes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'classes' 
  AND indexname = 'idx_classes_teacher_id';

-- 5. Verificar constraint de foreign key para teacher_id
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'classes'
    AND kcu.column_name = 'teacher_id';

-- ============================================================================
-- RESUMO ESPERADO:
-- ============================================================================
-- 1. Deve retornar 3 linhas: level, room, teacher_id
-- 2. Deve retornar 1 linha: color
-- 3. Deve incluir 'event' na lista de valores do enum
-- 4. Deve retornar o índice idx_classes_teacher_id
-- 5. Deve retornar a foreign key constraint
-- ============================================================================

