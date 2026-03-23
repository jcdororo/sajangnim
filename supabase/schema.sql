-- ============================================
-- 테이블 생성
-- ============================================

-- 웨이팅
create table if not exists waiting (
  id uuid default gen_random_uuid() primary key,
  phone varchar(20) not null,
  wait_number integer not null,
  status varchar(20) not null default 'waiting', -- waiting | called | seated | cancelled
  created_at timestamptz default now()
);

-- 웨이팅 번호 자동 채번 함수
create or replace function next_wait_number()
returns integer as $$
declare
  next_num integer;
begin
  select coalesce(max(wait_number), 0) + 1
  into next_num
  from waiting
  where created_at::date = current_date;
  return next_num;
end;
$$ language plpgsql;

-- 웨이팅 등록 시 wait_number 자동 세팅 트리거
create or replace function set_wait_number()
returns trigger as $$
begin
  new.wait_number := next_wait_number();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_set_wait_number
  before insert on waiting
  for each row execute function set_wait_number();

-- 테이블
create table if not exists tables (
  id uuid default gen_random_uuid() primary key,
  name varchar(50) not null,
  status varchar(20) not null default 'empty', -- empty | occupied
  capacity integer not null default 4
);

-- 메뉴 카테고리
create table if not exists menu_categories (
  id uuid default gen_random_uuid() primary key,
  name varchar(100) not null,
  sort_order integer not null default 0
);

-- 메뉴 아이템
create table if not exists menu_items (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references menu_categories(id) on delete cascade,
  name varchar(100) not null,
  price integer not null,
  description text,
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

-- 주문
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  table_id uuid references tables(id),
  status varchar(20) not null default 'pending', -- pending | cooking | ready | served
  total_price integer not null default 0,
  created_at timestamptz default now()
);

-- 주문 아이템
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  menu_item_name varchar(100) not null,
  price integer not null,
  quantity integer not null default 1
);

-- ============================================
-- Realtime 활성화
-- ============================================
alter publication supabase_realtime add table waiting;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;

-- ============================================
-- RLS (Row Level Security) - 개발 중 비활성화
-- ============================================
alter table waiting enable row level security;
alter table tables enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 모든 테이블 전체 접근 허용 (개발용, 배포 전 변경 필요)
create policy "allow all" on waiting for all using (true) with check (true);
create policy "allow all" on tables for all using (true) with check (true);
create policy "allow all" on menu_categories for all using (true) with check (true);
create policy "allow all" on menu_items for all using (true) with check (true);
create policy "allow all" on orders for all using (true) with check (true);
create policy "allow all" on order_items for all using (true) with check (true);

-- ============================================
-- 샘플 데이터
-- ============================================

-- 테이블 샘플
insert into tables (name, capacity) values
  ('1번 테이블', 4),
  ('2번 테이블', 4),
  ('3번 테이블', 2),
  ('4번 테이블', 6);

-- 메뉴 카테고리 샘플
insert into menu_categories (name, sort_order) values
  ('메인', 1),
  ('사이드', 2),
  ('음료', 3);

-- 메뉴 아이템 샘플
insert into menu_items (category_id, name, price, description, sort_order)
select id, '스테이크', 28000, '부드러운 안심 스테이크', 1 from menu_categories where name = '메인'
union all
select id, '파스타', 16000, '크림 파스타', 2 from menu_categories where name = '메인'
union all
select id, '샐러드', 8000, '신선한 그린 샐러드', 1 from menu_categories where name = '사이드'
union all
select id, '감자튀김', 5000, '바삭한 감자튀김', 2 from menu_categories where name = '사이드'
union all
select id, '아메리카노', 4000, '에스프레소 아메리카노', 1 from menu_categories where name = '음료'
union all
select id, '콜라', 2000, '탄산음료', 2 from menu_categories where name = '음료';
