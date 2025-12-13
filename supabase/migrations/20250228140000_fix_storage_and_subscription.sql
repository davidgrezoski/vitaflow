/*
  # Fix Storage Policies and Subscription Column
  
  ## Descrição
  Este script corrige o erro "policy already exists" garantindo que as políticas antigas sejam removidas antes de serem recriadas.
  Também verifica se a coluna 'subscription_status' já existe antes de tentar adicioná-la.

  ## Ações:
  1. Adiciona coluna 'subscription_status' na tabela 'profiles' (se não existir).
  2. Cria o bucket 'avatars' (se não existir).
  3. Remove políticas de storage conflitantes.
  4. Recria as políticas de storage corretas.
*/

-- 1. Adicionar coluna de assinatura de forma segura
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status text DEFAULT 'trial';
    END IF;
END $$;

-- 2. Garantir que o bucket de avatares existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Remover políticas antigas para evitar conflito (Erro 42710)
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;

-- 4. Recriar políticas de segurança
-- Permitir que qualquer pessoa veja as fotos de perfil
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Permitir que usuários autenticados façam upload de suas próprias fotos
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Permitir que usuários atualizem suas próprias fotos
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
