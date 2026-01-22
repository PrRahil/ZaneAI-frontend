"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <ErrorState
                title="Page Not Found"
                description="The page you are looking for does not exist or has been moved."
                icon={FileQuestion}
                action={
                    <Button asChild>
                        <Link href="/">Go to Dashboard</Link>
                    </Button>
                }
            />
        </div>
    );
}
