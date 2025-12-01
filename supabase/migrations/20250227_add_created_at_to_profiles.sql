/*
  # Add created_at to profiles
  
  ## Query Description: 
  Adiciona a coluna created_at na tabela de perfis para controlar o tempo de teste grátis.
  Se a coluna já existir, não faz nada. Define o padrão como o momento atual.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: public.profiles
  - Column: created_at (TIMESTAMPTZ)
*/

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
