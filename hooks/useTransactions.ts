import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Transaction } from '@/lib/types';
import { toast } from 'sonner';

export const useTransactions = (params?: Record<string, string | number>) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await api.get('/transactions', { params });
      return data;
    },
  });

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/dashboard');
      return data.stats;
    },
  });

export const useMonthlyTrend = (months = 6) =>
  useQuery({
    queryKey: ['monthly-trend', months],
    queryFn: async () => {
      const { data } = await api.get('/transactions/trend', { params: { months } });
      return data.trend;
    },
  });

export const useCategoryStats = (params?: { month?: number; year?: number; type?: string }) =>
  useQuery({
    queryKey: ['category-stats', params],
    queryFn: async () => {
      const { data } = await api.get('/transactions/category-stats', { params });
      return data.stats;
    },
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Transaction, '_id' | 'userId' | 'createdAt'>) =>
      api.post('/transactions', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['monthly-trend'] });
      qc.invalidateQueries({ queryKey: ['category-stats'] });
      toast.success('Transaction added successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add transaction'),
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Transaction> & { id: string }) =>
      api.put(`/transactions/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });
};
