create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 80),
  excerpt text not null check (char_length(excerpt) <= 120),
  category text not null default '分享' check (char_length(category) <= 12),
  author text not null check (char_length(author) <= 24),
  image text not null,
  image_path text,
  body text[] not null default '{}',
  tone text not null check (tone in ('cyan', 'blue', 'pink', 'navy', 'cream', 'orange')),
  size text not null default 'medium' check (size in ('short', 'medium', 'large', 'tall')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author text not null check (char_length(author) <= 24),
  body text not null check (char_length(body) <= 800),
  created_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.community_rate_limits (
  key text primary key,
  action text not null check (action in ('post', 'comment')),
  identity_hash text not null,
  bucket bigint not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists community_posts_created_at_idx on public.community_posts(created_at desc);
create index if not exists community_comments_post_created_idx on public.community_comments(post_id, created_at asc);
create index if not exists community_likes_post_idx on public.community_likes(post_id);
create index if not exists community_rate_limits_expires_at_idx on public.community_rate_limits(expires_at);

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
alter table public.community_rate_limits enable row level security;
