-- Adiciona colunas para suporte a avatar e notificações
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"workout": true, "water": true, "meal": false, "news": true}'::jsonb;

-- Criação do Bucket de Armazenamento para Avatars (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Segurança para o Storage (Avatars)
-- Permitir acesso público para leitura
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Permitir upload apenas para o próprio usuário
CREATE POLICY "Users can upload their own avatar." 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Permitir atualização apenas para o próprio usuário
CREATE POLICY "Users can update their own avatar." 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
