"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
  jiraConnectionSchema,
  JiraConnectionSchemaType,
} from "@/lib/validations/jiraSchema";

import {
  useTestJiraConnection,
  useSaveJiraConnection,
} from "@/hooks/useJira";

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
import { CheckCircle, AlertCircle, Trello } from "lucide-react";
import { parseErrorMessage } from "@/hooks/useAuth";

export default function JiraSetup() {
  const router = useRouter();

  const testConnection = useTestJiraConnection();
  const saveConnection = useSaveJiraConnection();

  const [connectionTested, setConnectionTested] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JiraConnectionSchemaType>({
    resolver: zodResolver(jiraConnectionSchema),
  });

  const onSubmit = (values: JiraConnectionSchemaType) => {
    testConnection.mutate(values, {
      onSuccess: () => {
        setConnectionTested(true);
        toast.success("Connection test successful!");

        saveConnection.mutate(values, {
          onSuccess: (data) => {
            console.log("Saved Jira connection:", data);
            toast.success("Jira connection saved successfully!");
            router.push("/setup/dbt-cloud");
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
    router.push("/setup/dbt-cloud");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Trello className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Jira Integration</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Connect your Jira workspace to automatically create tickets for impacted queries and track resolution status.
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
            Enter your Jira API credentials to enable bi-directional sync.
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
                  placeholder="e.g. Corporate Jira"
                  {...register("connection_name")}
                  className={errors.connection_name ? "border-red-500" : ""}
                />
                {errors.connection_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.connection_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="server_url">Jira Server URL</Label>
                <Input
                  id="server_url"
                  placeholder="https://your-domain.atlassian.net"
                  {...register("server_url")}
                  className={errors.server_url ? "border-red-500" : ""}
                />
                {errors.server_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.server_url.message}</p>
                )}
              </div>
            </div>

            {/* Auth Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="username">Email / Username</Label>
                <Input
                  id="username"
                  placeholder="user@example.com"
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="api_token">API Token</Label>
                <Input
                  id="api_token"
                  type="password"
                  placeholder="••••••••••••••••"
                  {...register("api_token")}
                  className={errors.api_token ? "border-red-500" : ""}
                />
                {errors.api_token && (
                  <p className="text-red-500 text-sm mt-1">{errors.api_token.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Generate from Atlassian Account Settings
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
