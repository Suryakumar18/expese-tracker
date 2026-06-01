'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wallet, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const perks = [
  'Free forever — no credit card needed',
  'Track unlimited transactions',
  'AI-powered spending insights',
  'Secure with JWT authentication',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] gradient-primary p-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ExpenseIQ</span>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Start your financial journey today
            </h1>
            <p className="text-white/70 text-lg">
              Join thousands of users who manage their money smarter with ExpenseIQ.
            </p>
          </div>
          <div className="space-y-3">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-white/80 shrink-0" />
                <span className="text-white/85 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/50 text-xs">© 2026 ExpenseIQ. Built for financial freedom.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8 animate-in">
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ExpenseIQ</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h2>
            <p className="text-muted-foreground text-sm">It only takes a minute</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required
                className="h-11 bg-muted/50 border-border focus-visible:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="h-11 bg-muted/50 border-border focus-visible:ring-primary" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="h-11 bg-muted/50 border-border focus-visible:ring-primary pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-1 pt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length > i * 2
                        ? password.length < 6 ? 'bg-red-400' : password.length < 10 ? 'bg-amber-400' : 'bg-green-400'
                        : 'bg-border'
                    }`} />
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={isLoading}
              className="w-full h-11 gradient-primary border-0 font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity text-white">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in instead →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
