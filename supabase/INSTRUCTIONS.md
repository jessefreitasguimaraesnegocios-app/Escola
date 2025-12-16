# Instruções para Configuração do Banco de Dados no Supabase

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Aguarde a criação do banco de dados (pode levar alguns minutos)

### 2. Executar o Schema SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `schema.sql` deste diretório
4. Copie todo o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em **Run** ou pressione `Ctrl+Enter`

### 3. Verificar a Criação
Após executar o schema, verifique se todas as tabelas foram criadas:
- Vá em **Table Editor** no painel do Supabase
- Você deve ver as seguintes tabelas:
  - `profiles`
  - `user_roles`
  - `subjects`
  - `classes`
  - `teachers`
  - `students`
  - `teacher_subjects`
  - `enrollments`
  - `grading_periods`
  - `grades`
  - `schedules`
  - `calendar_events`

### 4. Configurar Variáveis de Ambiente
No seu projeto React, crie um arquivo `.env.local` (ou `.env`) com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
```

Você encontra essas informações em:
- Supabase Dashboard → Settings → API

### 5. Criar Primeiro Usuário Admin (Opcional)
Após criar sua conta no sistema, você pode tornar um usuário admin executando o script `create_admin.sql` no SQL Editor.

## 🔐 Segurança

- Todas as tabelas têm **Row Level Security (RLS)** habilitado
- As políticas garantem que:
  - Usuários só veem seus próprios dados
  - Admins podem gerenciar tudo
  - Professores podem ver alunos e notas
  - Alunos só veem seus próprios dados

## 📊 Estrutura do Banco

### Tabelas Principais
- **profiles**: Perfis dos usuários
- **user_roles**: Roles dos usuários (admin, teacher, student, parent)
- **students**: Dados dos alunos
- **teachers**: Dados dos professores
- **subjects**: Disciplinas
- **classes**: Turmas
- **enrollments**: Matrículas
- **grades**: Notas
- **schedules**: Horários
- **calendar_events**: Eventos do calendário

### Relacionamentos
- Um usuário pode ter múltiplos roles
- Um aluno pertence a uma turma
- Um professor pode lecionar múltiplas disciplinas
- Notas são vinculadas a alunos, disciplinas e períodos de avaliação

## 🚀 Próximos Passos

1. Execute o schema SQL
2. Configure as variáveis de ambiente
3. Teste o login/cadastro no app
4. Crie um usuário admin se necessário
5. Comece a popular o banco com dados de teste

