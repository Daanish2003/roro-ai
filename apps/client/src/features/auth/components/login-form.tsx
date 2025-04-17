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
import Link from "next/link";

export default function LoginForm() {
	const { loginForm, loading, emailLoginHandler } = useAuth();
	

	return (
		<AuthCard
			title="Welcome Back!"
			description="Enter your email below to login"
			cardFooterLink="/auth/signup"
			cardFooterDescription="Don't have an account?"
			cardFooterLinkTitle="Sign Up"
		>
			<Form {...loginForm}>
				<form
					onSubmit={loginForm.handleSubmit(emailLoginHandler)}
					className="space-y-4"
				>
					<FormField
						control={loginForm.control}
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
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div>
									<Input
                                        disabled={loading}
                                        type="password"
                                        placeholder='********'
                                        {...field}
                                    />
									<Button 
									   asChild
									   variant={"link"}
									   className="p-0 h-4"
									   >
										<Link 
										  href="/auth/forgot-password"
										  className="text-muted-foreground text-[8px] ml-56"
										  >
										  Forgot Password?
										</Link>
									</Button>
									</div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button disabled={loading} type="submit" className='w-full bg-primary'>Login</Button>
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
