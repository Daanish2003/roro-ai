"use client"
import React from 'react'
import { AuthCard } from './auth-card';
import { useAuth } from '@/hooks/use-auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@roro-ai/ui/components/ui/form';
import { Button } from '@roro-ai/ui/components/ui/button';
import { Input } from '@roro-ai/ui/components/ui/input';

export default function ForgotPasswordForm() {
    const { forgotPasswordForm, loading, forgotPasswordHandler, sentResetPasswordLink, setSentResetPasswordLink } = useAuth();

	if(sentResetPasswordLink) {
		return (<AuthCard
		title="Reset Password Link has been send"
		description="Please check you mail box to and click the link to reset the password"
		cardFooterLink="/auth/login"
		cardFooterDescription="Remember your password?"
		cardFooterLinkTitle="Login"
		>
			
			<Button
			className='w-full'
			 onClick={() => {
				setSentResetPasswordLink(false)
			 }}
			>Resend Link</Button>
		</AuthCard>)
	}

	return (
		<AuthCard
			title="Forgot Your Password"
			description="Enter your email below to send link"
			cardFooterLink="/auth/login"
			cardFooterDescription="Remember your password?"
			cardFooterLinkTitle="Login"
		>
			<Form {...forgotPasswordForm}>
				<form
					onSubmit={forgotPasswordForm.handleSubmit(forgotPasswordHandler)}
					className="space-y-4"
				>
				    <FormField
						control={forgotPasswordForm.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="email"
										placeholder="example@gmail.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
                    <Button disabled={loading} type="submit" className='w-full bg-primary'>Send Link</Button>
				</form>
			</Form>
		</AuthCard>
	);
}
