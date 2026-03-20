-- Tabela de perfis (estende auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  fasting_min integer not null default 70,
  fasting_max integer not null default 99,
  postmeal_max integer not null default 139,
  created_at timestamptz not null default now()
);

-- Tabela de medições
create table measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  value integer not null,
  measured_at timestamptz not null,
  context text not null check (context in ('fasting', 'before_meal', 'after_meal')),
  food_notes text,
  insulin_dose text,
  physical_activity text,
  created_at timestamptz not null default now()
);

-- Tabela de lembretes
create table reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  time text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Segurança: cada usuário só acessa seus próprios dados
alter table profiles enable row level security;
alter table measurements enable row level security;
alter table reminders enable row level security;

create policy "Usuário acessa próprio perfil"
  on profiles for all
  using (auth.uid() = id);

create policy "Usuário acessa próprias medições"
  on measurements for all
  using (auth.uid() = profile_id);

create policy "Usuário acessa próprios lembretes"
  on reminders for all
  using (auth.uid() = profile_id);

-- Admin acessa todos os perfis da família
create policy "Admin acessa todos os perfis"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
