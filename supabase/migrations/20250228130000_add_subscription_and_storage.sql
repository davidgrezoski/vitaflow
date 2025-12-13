-- Adiciona coluna de status da assinatura
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';

-- Criação do Bucket de Armazenamento para Avatares (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Segurança para o Storage (Avatares)
-- Permitir acesso público para ver avatares
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatars."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update their own avatars."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
