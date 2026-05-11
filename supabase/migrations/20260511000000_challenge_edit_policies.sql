create policy "Creators can read created challenges"
on public.challenges for select
using (created_by = auth.uid());

create policy "Owners can delete goals"
on public.goals for delete
using (public.is_challenge_owner(challenge_id, auth.uid()));
