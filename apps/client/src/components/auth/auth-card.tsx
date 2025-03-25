"use client";

import { User } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";

export function AuthCard() {
	const { socialSignInHandler, anonymousSignInHandler, loading} = useAuth()
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
						<span className="bg-transparent px-2 text-muted-foreground">
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