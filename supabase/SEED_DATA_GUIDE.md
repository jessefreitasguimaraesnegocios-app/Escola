# Guia de Dados de Exemplo (Seed Data)

## 📋 O que este script cria:

Este script insere dados de exemplo no banco de dados para facilitar o teste do sistema:

### ✅ **10 Disciplinas**
- Matemática, Português, Física, Química, História, Geografia, Biologia, Educação Física, Artes, Inglês

### ✅ **8 Professores**
- Cada um com qualificações e status ativo
- Já associados às suas respectivas disciplinas

### ✅ **6 Turmas**
- 7º Ano A e B (Manhã)
- 8º Ano A (Manhã) e B (Tarde)
- 9º Ano A (Manhã) e B (Tarde)
- Cada turma com professor responsável e sala definida

### ✅ **13 Alunos**
- Distribuídos nas turmas do 7º, 8º e 9º ano
- Com dados completos: nome, email, telefone, data de nascimento, responsáveis

### ✅ **Matrículas**
- Todas os alunos matriculados no ano letivo 2024

### ✅ **4 Períodos de Avaliação**
- 1º, 2º, 3º e 4º Bimestres de 2024

### ✅ **Notas de Exemplo**
- Notas do 1º bimestre em Matemática e Português para alguns alunos

### ✅ **11 Eventos no Calendário**
- Feriados, provas, reuniões e eventos escolares

## 🚀 Como Executar

### Opção 1: SQL Editor do Supabase (Recomendado)

1. Acesse o **SQL Editor** no painel do Supabase
2. Clique em **New Query**
3. Abra o arquivo `supabase/seed_data.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via CLI (se configurado)

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/seed_data.sql
```

## ⚠️ Importante

- O script usa `ON CONFLICT DO NOTHING` para evitar erros se os dados já existirem
- Se quiser limpar os dados antes, descomente as linhas DELETE no início do script
- Os dados são criados de forma relacionada (professores associados a disciplinas, alunos às turmas, etc.)

## 🔄 Após Executar

1. Verifique as tabelas no **Table Editor** do Supabase
2. Teste as funcionalidades do sistema:
   - Cadastro de novos registros
   - Visualização de listas
   - Edição e exclusão
   - Relatórios e relatórios

## 📊 Dados de Login (se necessário)

Os dados criados não incluem usuários de autenticação. Para criar um usuário admin, use o script `create_admin.sql`.

## 🔍 Verificar Dados Criados

Execute este SQL para ver um resumo:

```sql
SELECT 
  (SELECT COUNT(*) FROM public.subjects) as disciplinas,
  (SELECT COUNT(*) FROM public.teachers) as professores,
  (SELECT COUNT(*) FROM public.classes) as turmas,
  (SELECT COUNT(*) FROM public.students) as alunos,
  (SELECT COUNT(*) FROM public.enrollments) as matriculas,
  (SELECT COUNT(*) FROM public.grading_periods) as periodos,
  (SELECT COUNT(*) FROM public.grades) as notas,
  (SELECT COUNT(*) FROM public.calendar_events) as eventos;
```

