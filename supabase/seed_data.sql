-- ============================================================================
-- SEED DATA - Dados de Exemplo para o Sistema SmartEscola
-- ============================================================================
-- Execute este script no SQL Editor do Supabase para popular o banco com dados de exemplo
-- ============================================================================

-- Limpar dados existentes (opcional - descomente se quiser limpar antes)
-- DELETE FROM public.grades;
-- DELETE FROM public.enrollments;
-- DELETE FROM public.teacher_subjects;
-- DELETE FROM public.schedules;
-- DELETE FROM public.calendar_events;
-- DELETE FROM public.students;
-- DELETE FROM public.teachers;
-- DELETE FROM public.subjects;
-- DELETE FROM public.classes;

-- ============================================================================
-- 1. DISCIPLINAS
-- ============================================================================

INSERT INTO public.subjects (name, code, description, workload_hours, color) VALUES
('Matemática', 'MAT001', 'Álgebra, Geometria e Cálculo', 4, 'bg-chart-1'),
('Português', 'POR001', 'Gramática, Literatura e Redação', 4, 'bg-chart-2'),
('Física', 'FIS001', 'Mecânica, Termodinâmica e Eletromagnetismo', 3, 'bg-chart-3'),
('Química', 'QUI001', 'Química Geral e Orgânica', 3, 'bg-chart-4'),
('História', 'HIS001', 'História do Brasil e Geral', 2, 'bg-chart-5'),
('Geografia', 'GEO001', 'Geografia Física e Humana', 2, 'bg-chart-1'),
('Biologia', 'BIO001', 'Biologia Celular, Genética e Ecologia', 3, 'bg-chart-2'),
('Educação Física', 'EDF001', 'Atividades Físicas e Esportivas', 2, 'bg-chart-3'),
('Artes', 'ART001', 'História da Arte e Expressão Artística', 2, 'bg-chart-4'),
('Inglês', 'ING001', 'Língua Inglesa', 3, 'bg-chart-5')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. PROFESSORES
-- ============================================================================

INSERT INTO public.teachers (full_name, email, phone, qualification, status) VALUES
('Maria Santos Silva', 'maria.santos@escola.com', '(11) 98888-1234', 'Mestrado em Matemática', 'active'),
('Carlos Oliveira Costa', 'carlos.oliveira@escola.com', '(11) 98888-2345', 'Doutorado em Física', 'active'),
('Ana Paula Ferreira', 'ana.ferreira@escola.com', '(11) 98888-3456', 'Especialização em Letras', 'active'),
('Roberto Lima Souza', 'roberto.lima@escola.com', '(11) 98888-4567', 'Mestrado em História', 'active'),
('Fernanda Costa Alves', 'fernanda.costa@escola.com', '(11) 98888-5678', 'Mestrado em Biologia', 'active'),
('Pedro Almeida Santos', 'pedro.almeida@escola.com', '(11) 98888-6789', 'Licenciatura em Educação Física', 'active'),
('Laura Mendes Pereira', 'laura.mendes@escola.com', '(11) 98888-7890', 'Especialização em Inglês', 'active'),
('Paula Santos Rocha', 'paula.santos@escola.com', '(11) 98888-8901', 'Bacharelado em Artes', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. ASSOCIAR PROFESSORES ÀS DISCIPLINAS
-- ============================================================================

-- Maria Santos - Matemática
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'maria.santos@escola.com' AND s.code = 'MAT001'
ON CONFLICT DO NOTHING;

-- Carlos Oliveira - Física e Química
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'carlos.oliveira@escola.com' AND s.code IN ('FIS001', 'QUI001')
ON CONFLICT DO NOTHING;

-- Ana Paula - Português
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'ana.ferreira@escola.com' AND s.code = 'POR001'
ON CONFLICT DO NOTHING;

-- Roberto Lima - História e Geografia
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'roberto.lima@escola.com' AND s.code IN ('HIS001', 'GEO001')
ON CONFLICT DO NOTHING;

-- Fernanda Costa - Biologia
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'fernanda.costa@escola.com' AND s.code = 'BIO001'
ON CONFLICT DO NOTHING;

-- Pedro Almeida - Educação Física
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'pedro.almeida@escola.com' AND s.code = 'EDF001'
ON CONFLICT DO NOTHING;

-- Laura Mendes - Inglês
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'laura.mendes@escola.com' AND s.code = 'ING001'
ON CONFLICT DO NOTHING;

-- Paula Santos - Artes
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT t.id, s.id
FROM public.teachers t, public.subjects s
WHERE t.email = 'paula.santos@escola.com' AND s.code = 'ART001'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. TURMAS
-- ============================================================================

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '7º Ano A', 2024, 'Fundamental II', 'morning', 35, 'Sala 101', t.id
FROM public.teachers t
WHERE t.email = 'maria.santos@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '7º Ano B', 2024, 'Fundamental II', 'morning', 35, 'Sala 102', t.id
FROM public.teachers t
WHERE t.email = 'ana.ferreira@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '8º Ano A', 2024, 'Fundamental II', 'morning', 35, 'Sala 103', t.id
FROM public.teachers t
WHERE t.email = 'roberto.lima@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '8º Ano B', 2024, 'Fundamental II', 'afternoon', 35, 'Sala 104', t.id
FROM public.teachers t
WHERE t.email = 'carlos.oliveira@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '9º Ano A', 2024, 'Fundamental II', 'morning', 35, 'Sala 105', t.id
FROM public.teachers t
WHERE t.email = 'fernanda.costa@escola.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.classes (name, year, level, shift, max_capacity, room, teacher_id)
SELECT 
  '9º Ano B', 2024, 'Fundamental II', 'afternoon', 35, 'Sala 106', t.id
FROM public.teachers t
WHERE t.email = 'maria.santos@escola.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. ALUNOS
-- ============================================================================

-- Alunos do 7º Ano A
INSERT INTO public.students (full_name, email, phone, registration_number, status, class_id, birth_date, parent_name, parent_phone)
VALUES
('Ana Silva Santos', 'ana.silva@email.com', '(11) 99999-1234', '2024001', 'active', 
  (SELECT id FROM public.classes WHERE name = '7º Ano A' LIMIT 1), '2010-05-15', 'João Silva', '(11) 99999-0001'),
('Bruno Costa Oliveira', 'bruno.costa@email.com', '(11) 99999-2345', '2024002', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano A' LIMIT 1), '2010-08-20', 'Maria Costa', '(11) 99999-0002'),
('Carla Mendes Lima', 'carla.mendes@email.com', '(11) 99999-3456', '2024003', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano A' LIMIT 1), '2010-03-10', 'Pedro Mendes', '(11) 99999-0003'),
('Daniel Ferreira Souza', 'daniel.ferreira@email.com', '(11) 99999-4567', '2024004', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano A' LIMIT 1), '2010-11-25', 'Lucia Ferreira', '(11) 99999-0004'),
('Elena Rodrigues Alves', 'elena.rodrigues@email.com', '(11) 99999-5678', '2024005', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano A' LIMIT 1), '2010-07-12', 'Carlos Rodrigues', '(11) 99999-0005')
ON CONFLICT (registration_number) DO NOTHING;

-- Alunos do 7º Ano B
INSERT INTO public.students (full_name, email, phone, registration_number, status, class_id, birth_date, parent_name, parent_phone)
VALUES
('Felipe Martins Pereira', 'felipe.martins@email.com', '(11) 99999-6789', '2024006', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano B' LIMIT 1), '2010-09-30', 'Sandra Martins', '(11) 99999-0006'),
('Gabriela Santos Costa', 'gabriela.santos@email.com', '(11) 99999-7890', '2024007', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano B' LIMIT 1), '2010-04-18', 'Roberto Santos', '(11) 99999-0007'),
('Hugo Almeida Silva', 'hugo.almeida@email.com', '(11) 99999-8901', '2024008', 'active',
  (SELECT id FROM public.classes WHERE name = '7º Ano B' LIMIT 1), '2010-12-05', 'Patricia Almeida', '(11) 99999-0008')
ON CONFLICT (registration_number) DO NOTHING;

-- Alunos do 8º Ano A
INSERT INTO public.students (full_name, email, phone, registration_number, status, class_id, birth_date, parent_name, parent_phone)
VALUES
('Isabela Oliveira Costa', 'isabela.oliveira@email.com', '(11) 99999-9012', '2024009', 'active',
  (SELECT id FROM public.classes WHERE name = '8º Ano A' LIMIT 1), '2009-06-22', 'Fernando Oliveira', '(11) 99999-0009'),
('João Pedro Lima', 'joao.pedro@email.com', '(11) 99999-0123', '2024010', 'active',
  (SELECT id FROM public.classes WHERE name = '8º Ano A' LIMIT 1), '2009-10-14', 'Cristina Lima', '(11) 99999-0010')
ON CONFLICT (registration_number) DO NOTHING;

-- Alunos do 9º Ano A
INSERT INTO public.students (full_name, email, phone, registration_number, status, class_id, birth_date, parent_name, parent_phone)
VALUES
('Larissa Souza Rocha', 'larissa.souza@email.com', '(11) 99999-1235', '2024011', 'active',
  (SELECT id FROM public.classes WHERE name = '9º Ano A' LIMIT 1), '2008-02-28', 'Marcos Souza', '(11) 99999-0011'),
('Mateus Alves Pereira', 'mateus.alves@email.com', '(11) 99999-2346', '2024012', 'active',
  (SELECT id FROM public.classes WHERE name = '9º Ano A' LIMIT 1), '2008-09-16', 'Renata Alves', '(11) 99999-0012')
ON CONFLICT (registration_number) DO NOTHING;

-- ============================================================================
-- 6. MATRÍCULAS (ENROLLMENTS)
-- ============================================================================

INSERT INTO public.enrollments (student_id, class_id, academic_year, status, enrollment_date)
SELECT s.id, c.id, 2024, 'enrolled', CURRENT_DATE
FROM public.students s
CROSS JOIN public.classes c
WHERE s.class_id = c.id
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. PERÍODOS DE AVALIAÇÃO (GRADING PERIODS)
-- ============================================================================

INSERT INTO public.grading_periods (name, period_type, period_number, academic_year, start_date, end_date) VALUES
('1º Bimestre', 'bimonthly', 1, 2024, '2024-01-29', '2024-04-10'),
('2º Bimestre', 'bimonthly', 2, 2024, '2024-04-11', '2024-06-20'),
('3º Bimestre', 'bimonthly', 3, 2024, '2024-07-22', '2024-09-30'),
('4º Bimestre', 'bimonthly', 4, 2024, '2024-10-01', '2024-12-15')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. NOTAS (GRADES) - Exemplos para alguns alunos
-- ============================================================================

-- Notas do 1º Bimestre para alunos do 7º Ano A em Matemática
INSERT INTO public.grades (student_id, subject_id, grading_period_id, score)
SELECT 
  s.id,
  sub.id,
  gp.id,
  CASE 
    WHEN s.registration_number = '2024001' THEN 8.5
    WHEN s.registration_number = '2024002' THEN 7.8
    WHEN s.registration_number = '2024003' THEN 9.2
    WHEN s.registration_number = '2024004' THEN 6.5
    WHEN s.registration_number = '2024005' THEN 8.0
    ELSE 7.0
  END
FROM public.students s
CROSS JOIN public.subjects sub
CROSS JOIN public.grading_periods gp
WHERE sub.code = 'MAT001' 
  AND gp.period_number = 1
  AND s.registration_number IN ('2024001', '2024002', '2024003', '2024004', '2024005')
ON CONFLICT DO NOTHING;

-- Notas do 1º Bimestre para alunos do 7º Ano A em Português
INSERT INTO public.grades (student_id, subject_id, grading_period_id, score)
SELECT 
  s.id,
  sub.id,
  gp.id,
  CASE 
    WHEN s.registration_number = '2024001' THEN 9.0
    WHEN s.registration_number = '2024002' THEN 8.2
    WHEN s.registration_number = '2024003' THEN 9.5
    WHEN s.registration_number = '2024004' THEN 7.0
    WHEN s.registration_number = '2024005' THEN 8.5
    ELSE 7.5
  END
FROM public.students s
CROSS JOIN public.subjects sub
CROSS JOIN public.grading_periods gp
WHERE sub.code = 'POR001' 
  AND gp.period_number = 1
  AND s.registration_number IN ('2024001', '2024002', '2024003', '2024004', '2024005')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. EVENTOS DO CALENDÁRIO
-- ============================================================================

INSERT INTO public.calendar_events (title, description, event_type, start_date, end_date, all_day) VALUES
('Início das Aulas', 'Primeiro dia letivo de 2024', 'event', '2024-01-29', '2024-01-29', true),
('Carnaval', 'Feriado de Carnaval', 'holiday', '2024-02-12', '2024-02-13', true),
('Prova Bimestral - 1º Bim', 'Avaliação do primeiro bimestre', 'exam', '2024-03-25', '2024-03-25', true),
('Reunião de Pais', 'Reunião com pais e responsáveis', 'meeting', '2024-04-05', '2024-04-05', true),
('Tiradentes', 'Feriado Nacional', 'holiday', '2024-04-21', '2024-04-21', true),
('Entrega de Notas - 1º Bim', 'Data limite para entrega de notas do 1º bimestre', 'deadline', '2024-04-10', '2024-04-10', true),
('Dia do Trabalho', 'Feriado Nacional', 'holiday', '2024-05-01', '2024-05-01', true),
('Prova Bimestral - 2º Bim', 'Avaliação do segundo bimestre', 'exam', '2024-06-10', '2024-06-10', true),
('Festa Junina', 'Festa tradicional da escola', 'event', '2024-06-15', '2024-06-15', true),
('Recesso Escolar', 'Recesso de julho', 'holiday', '2024-07-01', '2024-07-31', true),
('Conselho de Classe', 'Reunião do conselho de classe', 'meeting', '2024-08-15', '2024-08-15', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIM DO SEED DATA
-- ============================================================================
-- 
-- RESUMO DOS DADOS CRIADOS:
-- - 10 Disciplinas
-- - 8 Professores
-- - 6 Turmas (7º A, 7º B, 8º A, 8º B, 9º A, 9º B)
-- - 13 Alunos distribuídos nas turmas
-- - Matrículas para todos os alunos
-- - 4 Períodos de avaliação (bimestres)
-- - Notas de exemplo para alguns alunos
-- - 11 Eventos no calendário
-- ============================================================================

