"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function AuthCard() {
	const router = useRouter()
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);

	const socialSignInHandler = async (provider: "github" | "google") => {
		try {
			await signIn.social(
				{
					provider: provider,
					callbackURL: 'http://localhost:3000/dashboard/overview'
				},
				{
					onSuccess: () => {
						sonnerToast("Login Successfully");
					},
					onError: (ctx) => {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: ctx.error.message,
						});
					},
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
				},
			);
		} catch (error) {
			console.error("Social SignIn Error:", error);
			toast({
				variant: "destructive",
				title: "Something went wrong... please try again",
			});
		}
	};

	const anonymousSignInHandler = async () => {
		try {
			await signIn.anonymous(
				{},
				{
					onSuccess: () => {
						sonnerToast("Login Successfully");
						router.replace("/dashboard/overview")
					},
					onError: (ctx) => {
						toast({
							variant: "destructive",
							title: "Login failed",
							description: ctx.error.message,
						});
					},
					onRequest: () => setLoading(true),
					onResponse: () => setLoading(false),
				},
			);
		} catch (error) {
			console.error("Anonynous SignIn Error:", error);
			toast({
				variant: "destructive",
				title: "Something went wrong... please try again",
			});
		}
	};

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">Create an account</CardTitle>
				<CardDescription>
					Enter your email below to create your account
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="grid grid-cols-2 gap-6">
					<Button
						disabled={loading}
						variant="outline"
						onClick={() => socialSignInHandler("github")}
					>
						<FaGithub />
						Github
					</Button>
					<Button
						disabled={loading}
						variant="outline"
						onClick={() => socialSignInHandler("google")}
					>
						<FaGoogle />
						Google
					</Button>
				</div>
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
							Or continue as
						</span>
					</div>
				</div>
				<Button
					variant="default"
					disabled={loading}
					onClick={() => anonymousSignInHandler()}
				>
					<User />
					Guest
				</Button>
			</CardContent>
		</Card>
	);
}
