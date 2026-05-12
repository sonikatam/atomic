create or replace function public.join_challenge_by_invite_code(raw_invite_code text)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  target_challenge public.challenges%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to join a challenge.';
  end if;

  select *
  into target_challenge
  from public.challenges
  where invite_code = upper(trim(raw_invite_code))
    and type = 'group';

  if not found then
    raise exception 'Invalid invite code. Double-check the code and try again.';
  end if;

  if exists (
    select 1
    from public.challenge_members
    where challenge_id = target_challenge.id
      and user_id = auth.uid()
  ) then
    raise exception 'You are already in this challenge.';
  end if;

  insert into public.challenge_members (challenge_id, user_id, role)
  values (target_challenge.id, auth.uid(), 'member');

  return target_challenge;
exception
  when unique_violation then
    raise exception 'You are already in this challenge.';
end;
$$;

revoke all on function public.join_challenge_by_invite_code(text) from public;
grant execute on function public.join_challenge_by_invite_code(text) to authenticated;
