-- 014: block sign-ups from throwaway email services. Run once in Supabase > SQL Editor.
-- The site checks the same list first (blocked-domains.js) so people see a clear message;
-- this database rule stops anyone who skips the site. Safe to run again.
-- To block another domain later:  insert into public.blocked_email_domains values ('example.com');

create table if not exists public.blocked_email_domains (domain text primary key check (domain = lower(domain)));
alter table public.blocked_email_domains enable row level security;   -- no policies: not readable from the site

insert into public.blocked_email_domains (domain) values
  ('10minutemail.com'), ('10minutemail.net'), ('20minutemail.com'), ('mailinator.com'), ('mailinator.net'), ('guerrillamail.com'),
  ('guerrillamail.net'), ('guerrillamail.org'), ('guerrillamailblock.com'), ('sharklasers.com'), ('grr.la'), ('pokemail.net'),
  ('spam4.me'), ('yopmail.com'), ('yopmail.fr'), ('yopmail.net'), ('temp-mail.org'), ('temp-mail.io'),
  ('tempmail.com'), ('tempmail.net'), ('tempmailo.com'), ('tempail.com'), ('tempr.email'), ('throwawaymail.com'),
  ('trashmail.com'), ('trashmail.de'), ('trashmail.net'), ('getnada.com'), ('nada.email'), ('dispostable.com'),
  ('maildrop.cc'), ('mailnesia.com'), ('mintemail.com'), ('mohmal.com'), ('moakt.com'), ('emailondeck.com'),
  ('fakeinbox.com'), ('fakemail.net'), ('mailcatch.com'), ('mailpoof.com'), ('mytemp.email'), ('spambox.us'),
  ('spamgourmet.com'), ('tempinbox.com'), ('burnermail.io'), ('discard.email'), ('dropmail.me'), ('emailfake.com'),
  ('email-temp.com'), ('inboxkitten.com'), ('mail.tm'), ('mail.gw'), ('minuteinbox.com'), ('tmail.ws'),
  ('tmpmail.org'), ('tmpmail.net'), ('byom.de'), ('linshiyouxiang.net'), ('mailto.plus'), ('fexpost.com'),
  ('fexbox.org'), ('rover.info'), ('chitthi.in'), ('any.pink'), ('merepost.com'), ('mailbox.in.ua'),
  ('disposablemail.com'), ('luxusmail.org'), ('33mail.com'), ('anonaddy.me'), ('spamex.com'), ('tempmailaddress.com'),
  ('tempmail.plus'), ('getairmail.com'), ('airmail.cc'), ('crazymailing.com'), ('tm2mail.com'), ('vomoto.com')
on conflict do nothing;

create or replace function public.block_disposable_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare d text := lower(split_part(coalesce(new.email, ''), '@', 2));
begin
  if d <> '' and exists (select 1 from blocked_email_domains b where d = b.domain or d like '%.' || b.domain) then
    raise exception 'Disposable email addresses are not allowed';
  end if;
  return new;
end $$;
drop trigger if exists block_disposable_email on auth.users;
create trigger block_disposable_email before insert on auth.users
  for each row execute function public.block_disposable_email();
