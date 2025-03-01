"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@roro-ai/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@roro-ai/ui/components/ui/card";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import useShowToast from "@/hooks/use-show-toast";

export function AuthCard() {
	const router = useRouter()
	const showToast = useShowToast();
	const [loading, setLoading] = useState(false);

	const socialSignInHandler = async (provider: "github" | "google") => {
		try {
			await signIn.social(
				{
					provider: provider,
					callbackURL: 'http://localhost:3000/dashboard/practice'
				},
				{
					onSuccess: () => {
						showToast({
							title: "Login Successfully",
							type: "success"
						});
					},
					onError: (ctx) => {
						showToast({
							type: "error",
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
			showToast({
				type: "error",
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
						showToast({
							title: "Login Successfully",
							type: "success"
						});
						router.replace("/dashboard/practice")
					},
					onError: (ctx) => {
						showToast({
							type: "error",
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
			showToast({
				type: "error",
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
						<span className="bg-background px-2 text-muted-foreground">
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