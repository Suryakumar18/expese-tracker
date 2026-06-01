import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { SavingsGoal } from '@/lib/types';
import { toast } from 'sonner';

export const useSavingsGoals = (status?: string) =>
  useQuery({
    queryKey: ['savings', status],
    queryFn: async () => {
      const { data } = await api.get('/savings', { params: status ? { status } : {} });
      return data.goals;
    },
  });

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<SavingsGoal, '_id' | 'userId' | 'currentAmount' | 'status'>) =>
      api.post('/savings', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      toast.success('Savings goal created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create goal'),
  });
};

export const useContributeToGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.post(`/savings/${id}/contribute`, { amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      toast.success('Contribution added!');
    },
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<SavingsGoal> & { id: string }) =>
      api.put(`/savings/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings'] }),
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/savings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      toast.success('Goal deleted');
    },
  });
};
