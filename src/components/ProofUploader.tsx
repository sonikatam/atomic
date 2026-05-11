import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { uploadProof } from '../services/checkinService';

interface ProofUploaderProps {
  userId: string;
  challengeId: string;
  goalId: string;
  value?: string | null;
  onChange: (url: string) => void;
}

export function ProofUploader({ userId, challengeId, goalId, value, onChange }: ProofUploaderProps) {
  const [loading, setLoading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadProof(file, userId, challengeId, goalId);
      onChange(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 text-sm text-white/65 transition hover:border-ember/50 hover:text-white">
      {value ? <img src={value} alt="Proof preview" className="h-12 w-12 rounded-xl object-cover" /> : <ImagePlus className="h-5 w-5 text-ember" />}
      <span>{loading ? 'Uploading...' : value ? 'Replace photo proof' : 'Add photo proof'}</span>
      <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    </label>
  );
}
