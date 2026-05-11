import type { NewGoalInput } from '../types';

export const initialGoal: NewGoalInput = {
  title: '',
  description: '',
  required: true,
  proof_type: 'none',
  target_value: null,
  target_unit: '',
};
