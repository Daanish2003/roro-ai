"use client"
import React from 'react'
import { AuthCard } from './auth-card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@roro-ai/ui/components/ui/form'
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@roro-ai/ui/components/ui/input';
import { Button } from '@roro-ai/ui/components/ui/button';

export default function ResetPasswordForm() {
    const { resetPasswordForm, loading, resetPasswordHandler, sentEmailVerificationLink, setSentEmailVerificationLink } = useAuth();

    

  return (
    <AuthCard
			title="Reset Your Password"
			description="Enter your new password below"
			cardFooterLink="/auth/login"
			cardFooterDescription="Remember your password?"
			cardFooterLinkTitle="Login"
		>
			<Form {...resetPasswordForm}>
				<form
					onSubmit={resetPasswordForm.handleSubmit(resetPasswordHandler)}
					className="space-y-4"
				>
                    <FormField
                        control={resetPasswordForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="password"
                                        placeholder='********'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={resetPasswordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        type="password"
                                        placeholder='********'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button disabled={loading} type="submit" className='w-full bg-primary'>Submit</Button>
				</form>
			</Form>
		</AuthCard>
  )
}
