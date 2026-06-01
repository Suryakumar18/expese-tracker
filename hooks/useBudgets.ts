import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useBudgets = (month?: number, year?: number) =>
  useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const { data } = await api.get('/budgets', { params: { month, year } });
      return data.budgets;
    },
  });

export const useSetBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { category: string; limitAmount: number; month: number; year: number }) =>
      api.post('/budgets', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget set successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to set budget'),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted');
    },
  });
};
