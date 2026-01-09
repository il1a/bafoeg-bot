-- Create tables
create table chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  session_id uuid not null, -- Critical for n8n memory pairing
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  events jsonb, -- Store raw tool/step metadata here
  status text check (status in ('streaming', 'complete', 'error')) default 'complete',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index chats_user_id_idx on chats(user_id);
create index messages_chat_id_idx on messages(chat_id);
create index chats_updated_at_idx on chats(updated_at desc);

-- RLS
alter table chats enable row level security;
alter table messages enable row level security;

create policy "Users can select own chats" on chats
  for select using (auth.uid() = user_id);

create policy "Users can insert own chats" on chats
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own chats" on chats
  for delete using (auth.uid() = user_id);

create policy "Users can select own messages" on messages
  for select using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert own messages" on messages
  for insert with check (auth.uid() = user_id);
