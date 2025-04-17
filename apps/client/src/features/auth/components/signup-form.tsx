"use client"
import React from "react";
import { AuthCard } from "./auth-card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@roro-ai/ui/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@roro-ai/ui/components/ui/input";
import { Button } from "@roro-ai/ui/components/ui/button";
import GoogleButton from "./google-button";
import GithubButton from "./github-button";

export default function SignUpForm() {
	const { signupForm, loading, emailSignUpHandler, setSentEmailVerificationLink, sentEmailVerificationLink } = useAuth();

	if(sentEmailVerificationLink) {
				return (<AuthCard
				title="Email verification Link has been send"
				description="Please check you mail box to and click the link to verify the email"
				cardFooterLink="/auth/login"
				cardFooterDescription="Remember your password?"
				cardFooterLinkTitle="Login"
				>
					
					<Button
					className='w-full'
					 onClick={() => {
						setSentEmailVerificationLink(false)
					 }}
					>Resend Link</Button>
				</AuthCard>)
		}

	return (
		<AuthCard
			title="Create an Account"
			description="Enter your email below to signup"
			cardFooterLink="/auth/login"
			cardFooterDescription="Already have an account?"
			cardFooterLinkTitle="Login"
		>
			<Form {...signupForm}>
				<form
					onSubmit={signupForm.handleSubmit(emailSignUpHandler)}
					className="space-y-4"
				>
                    <FormField
						control={signupForm.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Full Name</FormLabel>
								<FormControl>
									<Input
										disabled={loading}
										type="text"
										placeholder="john"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={signupForm.control}
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
                    <FormField
                        control={signupForm.control}
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
                    <Button disabled={loading} type="submit" className='w-full bg-primary'>SignUp</Button>
                    <div className="flex gap-x-4 items-center justify-center w-full">
                    <div className="bg-gray-800 w-1/2 h-[1px] rounded-full"/>
                    <span className="text-xs font-semibold">OR</span>
                    <div className="bg-gray-800 w-1/2 h-[1px] rounded-full"/>
                    </div>
                    <div className="space-y-2">
                        <GoogleButton />
                        <GithubButton />
                    </div>
				</form>
			</Form>
		</AuthCard>
	);
}
