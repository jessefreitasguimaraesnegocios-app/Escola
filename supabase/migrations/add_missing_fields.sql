-- ============================================================================
-- MIGRAÇÃO: Adicionar campos faltantes nas tabelas
-- ============================================================================
-- Este script adiciona os campos que estão sendo usados no app mas faltam no banco
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. Adicionar campos faltantes na tabela classes
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS level TEXT, -- Ex: "Fundamental II", "Ensino Médio"
  ADD COLUMN IF NOT EXISTS room TEXT,  -- Ex: "Sala 101"
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL; -- Professor responsável

-- Criar índice para teacher_id em classes
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);

-- 2. Adicionar campo color na tabela subjects (para visualização)
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'bg-chart-1'; -- Cor para exibição no frontend

-- 3. Adicionar valor 'event' ao enum event_type se não existir
-- Nota: PostgreSQL não suporta IF NOT EXISTS para ADD VALUE em ENUM
-- Este bloco verifica se o valor existe antes de adicionar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'event_type' 
      AND e.enumlabel = 'event'
  ) THEN
    ALTER TYPE public.event_type ADD VALUE 'event';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Valor "event" já existe no enum event_type';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao adicionar valor ao enum: %', SQLERRM;
END $$;

-- 4. Verificar e adicionar campo created_at em user_roles se não existir
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Adicionar comentários para documentação
COMMENT ON COLUMN public.classes.level IS 'Nível educacional: Fundamental II, Ensino Médio, etc';
COMMENT ON COLUMN public.classes.room IS 'Número ou identificador da sala de aula';
COMMENT ON COLUMN public.classes.teacher_id IS 'Professor responsável pela turma';
COMMENT ON COLUMN public.subjects.color IS 'Cor CSS para exibição no frontend (ex: bg-chart-1)';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

