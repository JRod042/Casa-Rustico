-- Casa Rústico Hacienda Rewards — per-user profiles, ledger, orders, wallet, gifts

create table if not exists profiles (
  user_id          text primary key,
  display_name     text,
  birthday_month   int,
  birthday_day     int,
  favorite_store_id text,
  beans            int not null default 0,
  lifetime_beans   int not null default 0,
  wallet_cents     int not null default 0,
  member_no        text not null,
  created_at       timestamptz not null default now()
);

create table if not exists bean_ledger (
  id         serial primary key,
  user_id    text not null,
  delta      int not null,
  reason     text not null,
  created_at timestamptz not null default now()
);
create index if not exists bean_ledger_user_idx on bean_ledger (user_id, created_at desc);

create table if not exists orders (
  id           serial primary key,
  user_id      text not null,
  store_id     text not null,
  status       text not null default 'preparing',
  total_cents  int not null,
  beans_earned int not null default 0,
  beans_spent  int not null default 0,
  pay_with     text not null default 'wallet',
  items_json   text not null,
  created_at   timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id, created_at desc);

create table if not exists favorites (
  user_id     text not null,
  product_id  text not null,
  custom_json text,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists saved_drinks (
  id          serial primary key,
  user_id     text not null,
  product_id  text not null,
  name        text not null,
  custom_json text not null,
  created_at  timestamptz not null default now()
);
create index if not exists saved_drinks_user_idx on saved_drinks (user_id);

create table if not exists gifts (
  id               serial primary key,
  user_id          text not null,
  recipient_name   text not null,
  recipient_email  text,
  amount_cents     int not null,
  design_id        text not null,
  message          text,
  code             text not null,
  created_at       timestamptz not null default now()
);
create index if not exists gifts_user_idx on gifts (user_id, created_at desc);

create table if not exists offers_claimed (
  user_id    text not null,
  offer_id   text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);
