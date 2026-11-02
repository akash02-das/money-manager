'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, MapPin, Target, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { profileSchema, type ProfileFormData } from '../schemas/settings-schema';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '@/lib/formatters';

export function ProfileSettingsCard() {
  const { profile, updateProfile, isSaving } = useSettings();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      location: profile.location,
      monthlySavingsTarget: profile.monthlySavingsTarget,
    },
  });

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      location: profile.location,
      monthlySavingsTarget: profile.monthlySavingsTarget,
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Get Initials for Avatar
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-14 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials || 'MM'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Personal Profile
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Manage your personal identity, regional location, and monthly savings goal.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-semibold">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-name"
                  placeholder="e.g. Akash Das"
                  className="pl-9 h-9 text-xs"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-semibold">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="akash@example.com"
                  className="pl-9 h-9 text-xs"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-location" className="text-xs font-semibold">
                Location *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="pl-9 h-9 text-xs"
                  {...register('location')}
                />
              </div>
              {errors.location && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Monthly Savings Target */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-savings-target" className="text-xs font-semibold">
                Monthly Savings Goal (BDT ৳) *
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-savings-target"
                  type="number"
                  step="500"
                  placeholder="25000"
                  className="pl-9 h-9 text-xs"
                  {...register('monthlySavingsTarget', { valueAsNumber: true })}
                />
              </div>
              {errors.monthlySavingsTarget && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.monthlySavingsTarget.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  <CheckCircle2 className="size-4" />
                  <span>Profile updated successfully</span>
                </span>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !isDirty}
              className="gap-2 cursor-pointer font-semibold shadow-xs"
            >
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
