-- NANI?! Card Game — Database Schema

-- Player profiles (linked to Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  games_played int default 0,
  games_won int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Online games
create table games (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status text check (status in ('waiting', 'playing', 'finished')) default 'waiting',
  host_id uuid references profiles(id),
  state jsonb,
  max_players int default 6 check (max_players between 3 and 6),
  bot_count int default 0,
  bot_difficulty text check (bot_difficulty in ('easy', 'medium', 'hard')) default 'medium',
  created_at timestamptz default now(),
  finished_at timestamptz
);

alter table games enable row level security;

create policy "Games are viewable by participants"
  on games for select using (true);

create policy "Authenticated users can create games"
  on games for insert with check (auth.uid() = host_id);

create policy "Host can update game"
  on games for update using (auth.uid() = host_id);

-- Players in a game
create table game_players (
  game_id uuid references games(id) on delete cascade,
  player_id uuid references profiles(id) on delete cascade,
  seat_index int not null,
  is_bot boolean default false,
  joined_at timestamptz default now(),
  primary key (game_id, player_id)
);

alter table game_players enable row level security;

create policy "Game players are viewable by participants"
  on game_players for select using (true);

create policy "Players can join games"
  on game_players for insert with check (auth.uid() = player_id);

-- Generate a unique 6-character room code
create or replace function generate_room_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Auto-generate room code on game creation
create or replace function set_game_code()
returns trigger as $$
begin
  if new.code is null or new.code = '' then
    new.code := generate_room_code();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_game_code_trigger
  before insert on games
  for each row
  execute function set_game_code();

-- Realtime: enable for games table
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table game_players;
