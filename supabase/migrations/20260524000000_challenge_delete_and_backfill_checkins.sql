create policy "Owners can delete challenges"
on public.challenges for delete
using (created_by = auth.uid() or public.is_challenge_owner(id, auth.uid()));

drop policy if exists "Users can update only their same-day checkins" on public.daily_checkins;

create policy "Users can update their own past and current checkins"
on public.daily_checkins for update
using (
  auth.uid() = user_id
  and checkin_date <= current_date
  and public.is_challenge_member(challenge_id, auth.uid())
)
with check (
  auth.uid() = user_id
  and checkin_date <= current_date
  and public.is_challenge_member(challenge_id, auth.uid())
);
