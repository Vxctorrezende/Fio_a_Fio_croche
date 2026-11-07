-- Execute este arquivo no SQL Editor do painel Supabase.
create extension if not exists pgcrypto;

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  papel text not null default 'cliente' check (papel in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  valor numeric(10, 2) not null check (valor > 0),
  imagem_url text,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;
alter table public.produtos enable row level security;

grant select on public.perfis to authenticated;
grant select, insert, delete on public.produtos to authenticated;

create or replace function public.criar_perfil_cliente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, papel)
  values (new.id, 'cliente')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute procedure public.criar_perfil_cliente();

drop policy if exists "Usuário pode ler próprio perfil" on public.perfis;
create policy "Usuário pode ler próprio perfil"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Usuário autenticado pode ver produtos" on public.produtos;
create policy "Usuário autenticado pode ver produtos"
  on public.produtos for select to authenticated
  using (true);

drop policy if exists "Admin pode inserir produtos" on public.produtos;
create policy "Admin pode inserir produtos"
  on public.produtos for insert to authenticated
  with check (
    exists (select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin')
  );

drop policy if exists "Admin pode excluir produtos" on public.produtos;
create policy "Admin pode excluir produtos"
  on public.produtos for delete to authenticated
  using (
    exists (select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin')
  );

-- Imagens têm URLs públicas para aparecer no catálogo autenticado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Leitura pública das fotos de produtos" on storage.objects;
create policy "Leitura pública das fotos de produtos"
  on storage.objects for select to public
  using (bucket_id = 'produtos');

drop policy if exists "Admin pode enviar fotos de produtos" on storage.objects;
create policy "Admin pode enviar fotos de produtos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'produtos'
    and exists (select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin')
  );

drop policy if exists "Admin pode excluir fotos de produtos" on storage.objects;
create policy "Admin pode excluir fotos de produtos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'produtos'
    and exists (select 1 from public.perfis where id = (select auth.uid()) and papel = 'admin')
  );

-- Necessário para a atualização automática via Supabase Realtime.
do $$
begin
  alter publication supabase_realtime add table public.produtos;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
