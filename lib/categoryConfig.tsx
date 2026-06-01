import {
  UtensilsCrossed, Car, ShoppingBag, Gamepad2, FileText, Heart,
  GraduationCap, Plane, MoreHorizontal, Briefcase, Building2,
  Laptop, TrendingUp, DollarSign,
} from 'lucide-react';
import { ElementType } from 'react';

interface CategoryConfig {
  icon: ElementType;
  bg: string;
  iconColor: string;
  label: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Expense
  Food:          { icon: UtensilsCrossed, bg: 'bg-orange-500/15',  iconColor: 'text-orange-500',  label: 'Food' },
  Transport:     { icon: Car,            bg: 'bg-blue-500/15',     iconColor: 'text-blue-500',    label: 'Transport' },
  Shopping:      { icon: ShoppingBag,    bg: 'bg-pink-500/15',     iconColor: 'text-pink-500',    label: 'Shopping' },
  Entertainment: { icon: Gamepad2,       bg: 'bg-purple-500/15',   iconColor: 'text-purple-500',  label: 'Entertainment' },
  Bills:         { icon: FileText,       bg: 'bg-slate-500/15',    iconColor: 'text-slate-500',   label: 'Bills' },
  Medical:       { icon: Heart,          bg: 'bg-red-500/15',      iconColor: 'text-red-500',     label: 'Medical' },
  Education:     { icon: GraduationCap,  bg: 'bg-teal-500/15',     iconColor: 'text-teal-600',    label: 'Education' },
  Travel:        { icon: Plane,          bg: 'bg-sky-500/15',      iconColor: 'text-sky-500',     label: 'Travel' },
  // Income
  Salary:        { icon: Briefcase,      bg: 'bg-emerald-500/15',  iconColor: 'text-emerald-600', label: 'Salary' },
  Business:      { icon: Building2,      bg: 'bg-green-500/15',    iconColor: 'text-green-600',   label: 'Business' },
  Freelance:     { icon: Laptop,         bg: 'bg-violet-500/15',   iconColor: 'text-violet-500',  label: 'Freelance' },
  Investments:   { icon: TrendingUp,     bg: 'bg-amber-500/15',    iconColor: 'text-amber-500',   label: 'Investments' },
  Other:         { icon: MoreHorizontal, bg: 'bg-gray-500/15',     iconColor: 'text-gray-500',    label: 'Other' },
};

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? {
    icon: DollarSign, bg: 'bg-primary/10', iconColor: 'text-primary', label: category,
  };
}
