import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { uploadProof } from '../services/checkinService';

interface ProofUploaderProps {
  userId: string;
  challengeId: string;
  goalId: string;
  checkinDate: string;
  value?: string | null;
  onChange: (url: string) => void | Promise<void>;
}

export function ProofUploader({ userId, challengeId, goalId, checkinDate, value, onChange }: ProofUploaderProps) {
  const [loading, setLoading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadProof(file, userId, challengeId, goalId, checkinDate);
      await onChange(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-950">
      {value ? <img src={value} alt="Proof preview" className="h-12 w-12 rounded-xl object-cover" /> : <ImagePlus className="h-5 w-5 text-zinc-600" />}
      <span>{loading ? 'Uploading...' : value ? 'Replace photo proof' : 'Add photo proof'}</span>
      <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    </label>
  );
}
