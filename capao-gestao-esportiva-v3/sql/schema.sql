-- Modelo de banco para Supabase/PostgreSQL.
-- A regra principal é: tudo que pertence a um campeonato recebe campeonato_id.

create table if not exists campeonatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  modalidade text not null,
  inicio date not null,
  fim date not null,
  inscricoes_abertas boolean default false,
  fases text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists equipes (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  nome text not null,
  responsavel text not null,
  whatsapp text not null,
  created_at timestamptz default now()
);

create table if not exists atletas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text not null unique,
  nascimento date,
  created_at timestamptz default now()
);

create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  equipe_id uuid references equipes(id) on delete cascade,
  atleta_id uuid references atletas(id) on delete cascade,
  situacao text default 'liberado',
  observacao text,
  created_at timestamptz default now()
);

create table if not exists denuncias (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  protocolo text not null unique,
  equipe_reclamante text not null,
  responsavel text not null,
  equipe_denunciada text,
  atleta_citado text,
  motivo text not null,
  descricao text not null,
  status text default 'Recebida',
  created_at timestamptz default now()
);

create table if not exists punicoes (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  atleta_id uuid references atletas(id),
  equipe text,
  motivo text not null,
  descricao text,
  data_inicio date not null,
  data_fim date not null,
  visivel_publico boolean default true,
  created_at timestamptz default now()
);

create table if not exists jogos (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  fase text,
  time_a text not null,
  time_b text not null,
  data_jogo timestamptz,
  gols_a integer,
  gols_b integer,
  status text default 'Agendado',
  created_at timestamptz default now()
);

create table if not exists gols (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid references campeonatos(id) on delete cascade,
  jogo_id uuid references jogos(id) on delete cascade,
  atleta_id uuid references atletas(id),
  atleta_nome text not null,
  equipe text not null,
  quantidade integer default 1,
  created_at timestamptz default now()
);

create table if not exists auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario text not null,
  acao text not null,
  tabela text,
  registro_id uuid,
  dados jsonb,
  created_at timestamptz default now()
);
