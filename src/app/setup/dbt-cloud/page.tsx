"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
    dbtCloudSchema,
    DbtCloudSchemaType,
} from "@/lib/validations/dbtCloudSchema";

import {
    useTestDbtCloudConnection,
    useSaveDbtCloudConnection,
} from "@/hooks/useDbtCloud";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Cloud } from "lucide-react";
import { parseErrorMessage } from "@/hooks/useAuth";

export default function DbtCloudSetup() {
    const router = useRouter();

    const testConnection = useTestDbtCloudConnection();
    const saveConnection = useSaveDbtCloudConnection();

    const [connectionTested, setConnectionTested] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<DbtCloudSchemaType>({
        resolver: zodResolver(dbtCloudSchema),
        defaultValues: {
            connection_name: "DBT Cloud",
        },
    });

    const onSubmit = (values: DbtCloudSchemaType) => {
        testConnection.mutate(values, {
            onSuccess: () => {
                setConnectionTested(true);
                toast.success("Connection test successful!");

                saveConnection.mutate(values, {
                    onSuccess: (data) => {
                        console.log("Saved DBT Cloud connection:", data);
                        toast.success("DBT Cloud connection saved successfully!");
                        router.push("/setup/schedule");
                    },
                    onError: (error) => {
                        const message = parseErrorMessage(error);
                        toast.error("Failed to save connection");
                        setError("root", { message });
                    },
                });
            },
            onError: (error) => {
                const msg = parseErrorMessage(error);
                setError("root", { message: msg });
                toast.error(msg || "Connection test failed");
                setConnectionTested(false);
            },
        });
    };

    const handleSkip = () => {
        router.push("/setup/schedule");
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Cloud className="h-6 w-6 text-orange-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">DBT Cloud Integration</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect your DBT Cloud account to sync jobs, runs, and track data transformations.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        Connection Details
                        {connectionTested && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                        )}
                    </CardTitle>
                    <CardDescription>
                        Enter your DBT Cloud API credentials to enable integration.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Basic Info */}
                        <div className="grid gap-3">
                            <div>
                                <Label htmlFor="connection_name">Connection Name</Label>
                                <Input
                                    id="connection_name"
                                    placeholder="e.g. Production DBT Cloud"
                                    {...register("connection_name")}
                                    className={errors.connection_name ? "border-red-500" : ""}
                                />
                                {errors.connection_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.connection_name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="base_url">Base URL</Label>
                                <Input
                                    id="base_url"
                                    placeholder="https://cloud.getdbt.com"
                                    {...register("base_url")}
                                    className={errors.base_url ? "border-red-500" : ""}
                                />
                                {errors.base_url && (
                                    <p className="text-red-500 text-sm mt-1">{errors.base_url.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="account_id">Account ID</Label>
                                <Input
                                    id="account_id"
                                    placeholder="123456"
                                    {...register("account_id")}
                                    className={errors.account_id ? "border-red-500" : ""}
                                />
                                {errors.account_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.account_id.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Find in your DBT Cloud account settings
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="api_key">Service Token / API Key</Label>
                                <Input
                                    id="api_key"
                                    type="password"
                                    placeholder="dbt_••••••••••••••••"
                                    {...register("api_key")}
                                    className={errors.api_key ? "border-red-500" : ""}
                                />
                                {errors.api_key && (
                                    <p className="text-red-500 text-sm mt-1">{errors.api_key.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Generate from DBT Cloud profile settings
                                </p>
                            </div>
                        </div>


                        {errors.root && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {errors.root.message}
                            </div>
                        )}

                        <div className="pt-2 space-y-3">
                            <Button
                                type="submit"
                                className="w-full text-base"
                                disabled={testConnection.isPending || saveConnection.isPending}
                            >
                                {testConnection.isPending
                                    ? "Testing Connection..."
                                    : saveConnection.isPending
                                        ? "Saving Configuration..."
                                        : "Test & Connect"}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-sm text-muted-foreground hover:text-foreground"
                                onClick={handleSkip}
                            >
                                Skip for Now
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
