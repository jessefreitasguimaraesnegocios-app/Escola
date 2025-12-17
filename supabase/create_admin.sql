-- ============================================================================
-- SCRIPT PARA CRIAR USUÁRIO ADMIN
-- ============================================================================
-- Execute este script APÓS criar sua conta no sistema
-- Substitua 'SEU_EMAIL_AQUI' pelo email da conta que você criou
-- ============================================================================

-- Atualizar role do usuário para admin
-- Substitua 'seu-email@exemplo.com' pelo email da sua conta
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@gmail.com'
);

-- Se o usuário não tiver role ainda, criar uma nova
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@gmail.com'
AND NOT EXISTS (
  SELECT 1 
  FROM public.user_roles 
  WHERE user_id = auth.users.id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se foi criado corretamente
SELECT 
  u.email,
  ur.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

