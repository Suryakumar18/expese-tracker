'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Lock, Globe } from 'lucide-react';
import api from '@/lib/api';

const CURRENCIES = [
  { code: 'INR', label: '₹ Indian Rupee (INR)', flag: '🇮🇳' },
  { code: 'USD', label: '$ US Dollar (USD)',     flag: '🇺🇸' },
  { code: 'EUR', label: '€ Euro (EUR)',           flag: '🇪🇺' },
  { code: 'GBP', label: '£ British Pound (GBP)', flag: '🇬🇧' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName]         = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name, currency });
      updateUser({ name: data.user.name, currency: data.user.currency });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPasswordLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <Card className="bg-card border-border/60 shadow-sm overflow-hidden">
        <div className="h-20 gradient-primary relative">
          <div className="absolute -bottom-8 left-6">
            <Avatar className="w-16 h-16 ring-4 ring-card">
              <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-12 pb-5 px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">{user?.currency}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card className="bg-card border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required
                  className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                <Input value={user?.email} disabled className="h-10 bg-muted/30 border-border/40 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Currency
              </Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v ?? 'INR')}>
                <SelectTrigger className="h-10 bg-muted/50 border-border/60 w-full sm:w-72 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/60">
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">{c.flag} {c.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={profileLoading}
                className="gradient-primary border-0 shadow-lg shadow-primary/20 hover:opacity-90 text-white px-6">
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="bg-card border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                  className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  className="h-10 bg-muted/50 border-border/60 focus-visible:ring-primary" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={passwordLoading} variant="outline"
                className="border-border/60 hover:bg-muted/80 px-6">
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
