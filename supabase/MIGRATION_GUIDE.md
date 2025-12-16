# Guia de Migração - Campos Faltantes

## 📋 Campos Identificados que Faltam no Banco de Dados

Após comparar o código do app com o schema do banco, foram identificados os seguintes campos que estão sendo usados no frontend mas não existem nas tabelas:

### 1. **Tabela `classes` (Turmas)**
- ✅ `level` (TEXT) - Nível educacional: "Fundamental II", "Ensino Médio", etc.
- ✅ `room` (TEXT) - Número da sala: "Sala 101", "Sala 102", etc.
- ✅ `teacher_id` (UUID) - Referência ao professor responsável pela turma

### 2. **Tabela `subjects` (Disciplinas)**
- ✅ `color` (TEXT) - Cor CSS para visualização: "bg-chart-1", "bg-chart-2", etc.

### 3. **Enum `event_type` (Calendário)**
- ✅ `event` - Valor adicional para eventos gerais (já existe 'other', mas o app usa 'event')

## 🚀 Como Aplicar a Migração

### Opção 1: SQL Editor do Supabase (Recomendado)

1. Acesse o **SQL Editor** no painel do Supabase
2. Abra o arquivo `supabase/migrations/add_missing_fields.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via CLI do Supabase (Se configurado)

```bash
supabase db push
```

Ou execute o arquivo diretamente:

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/migrations/add_missing_fields.sql
```

## ✅ Verificação Pós-Migração

Após executar a migração, verifique se os campos foram adicionados:

```sql
-- Verificar campos da tabela classes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'classes' 
  AND column_name IN ('level', 'room', 'teacher_id');

-- Verificar campos da tabela subjects
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
  AND column_name = 'color';

-- Verificar valores do enum event_type
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type');
```

## ⚠️ Notas Importantes

1. **Campo `enrolled` em classes**: Este campo não precisa ser adicionado, pois pode ser calculado dinamicamente através da contagem de matrículas na tabela `enrollments`.

2. **Campo `teacher` em disciplinas**: O relacionamento entre professores e disciplinas já existe através da tabela `teacher_subjects`. No app, o campo "teacher" deve ser obtido através de uma query JOIN.

3. **Notas (Grades)**: O sistema de notas usa períodos de avaliação (`grading_periods`). As notas individuais (bim1, bim2, etc.) devem ser armazenadas na tabela `grades` vinculadas aos períodos correspondentes.

## 🔄 Próximos Passos

Após aplicar a migração:

1. Teste as funcionalidades do app relacionadas a:
   - Cadastro e edição de turmas (deve salvar level, room, teacher_id)
   - Cadastro de disciplinas (deve salvar color)
   - Criação de eventos no calendário (deve aceitar tipo 'event')

2. Se necessário, ajuste o código do frontend para:
   - Salvar os novos campos quando criar/editar registros
   - Exibir os campos corretamente nas listagens

3. Considere criar views ou funções SQL para facilitar queries complexas, especialmente para:
   - Contagem de alunos matriculados por turma
   - Listagem de disciplinas com professores associados
   - Agregação de notas por bimestre

