"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@roro-ai/ui/components/ui/card";
import Link from "next/link";
import React from "react";

export function AuthCard({
	title,
	description,
	cardFooterLink,
	cardFooterDescription,
	cardFooterLinkTitle,
	children,
}: {
	title: string;
	description: string;
	cardFooterLink: string;
	cardFooterDescription: string;
	cardFooterLinkTitle: string;
	children: React.ReactElement;
}) {
	return (
		<Card className="border-none bg-transparent w-[350px]">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>

			<CardContent className="grid gap-4">
				{children}
			</CardContent>
			{cardFooterLink && (
				<CardFooter className="flex items-center justify-center gap-x-1 text-xs text-muted-foreground">
					{cardFooterDescription && <span>{cardFooterDescription}</span>}
					<Link
						href={cardFooterLink}
						className="underline text-primary hover:text-primary/75"
					>
						{cardFooterLinkTitle}
					</Link>
				</CardFooter>
			)}
		</Card>
	);
}
