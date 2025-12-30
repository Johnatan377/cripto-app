-- ⚠️ ATENÇÃO: ESTE SCRIPT APAGA TODOS OS USUÁRIOS!

-- 1. Limpa a tabela de perfis (dados públicos)
DELETE FROM public.profiles;

-- 2. Limpa a tabela de usuários de autenticação (logins)
-- Só funciona se executado no SQL Editor do Supabase com privilégios de admin
DELETE FROM auth.users;

-- Se houver erro de Foreign Key (FK), use CASCADE:
-- TRUNCATE public.profiles CASCADE;
-- DELETE FROM auth.users;
