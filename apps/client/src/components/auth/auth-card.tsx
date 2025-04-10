"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@roro-ai/ui/components/ui/card";
import GoogleButton from './google-button';
import GithubButton from "./github-button";

export function AuthCard() {
	
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>
					Login or Signup using Google or Github
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex flex-col gap-2">
				    <GoogleButton />
					<GithubButton />
				</div>
			</CardContent>
		</Card>
	);
}