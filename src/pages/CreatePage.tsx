import { CreateChallengeForm } from '../components/CreateChallengeForm';

export function CreatePage() {
  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-ember">New challenge</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Design the next streak.</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">Create a friend challenge with proof, or keep it private with a self challenge.</p>
      </div>
      <CreateChallengeForm />
    </div>
  );
}
