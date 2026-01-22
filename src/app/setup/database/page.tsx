"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
  snowflakeConnectionSchema,
  SnowflakeConnectionSchemaType,
} from "@/lib/validations/snowflakeSchema";

import {
  useTestConnection,
  useSaveConnection,
  useFetchDatabases,
  useFetchSchemas,
  useSaveDatabaseSelection,
  useSaveSchemaSelection,
} from "@/hooks/useSnowflake";

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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Database, CheckCircle, ArrowRight } from "lucide-react";
import { DatabaseTreeSelector } from "@/components/ui/database-tree-selector";
import { Badge } from "@/components/ui/badge";
import { parseErrorMessage } from "@/hooks/useAuth";
import { explainCron } from "@/lib/cronUtils";

export default function DatabaseSetup() {
  const router = useRouter();

  const testConnection = useTestConnection();
  const saveConnection = useSaveConnection();
  const saveDatabaseSelection = useSaveDatabaseSelection();
  const saveSchemaSelection = useSaveSchemaSelection();

  const [step, setStep] = useState(1);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [connectionTested, setConnectionTested] = useState(false);

  const { data: databases = [], isLoading: loadingDatabases } =
    useFetchDatabases(connectionId || "");

  const fetchSchemas = useFetchSchemas();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<SnowflakeConnectionSchemaType>({
    resolver: zodResolver(snowflakeConnectionSchema),
    defaultValues: {
      cron_expression: "* * * * *",
    },
  });

  const onSubmit = (values: SnowflakeConnectionSchemaType) => {
    const payload = {
      connection_name: values.connectionName,
      account: values.account,
      username: values.username,
      password: values.password,
      warehouse: values.warehouse,
      role: values.role,
      cron_expression: values.cron_expression,
    };

    testConnection.mutate(payload, {
      onSuccess: () => {
        setConnectionTested(true);
        saveConnection.mutate(payload, {
          onSuccess: (data) => {
            console.log("Saved connection data:", data);
            toast.success("Connection saved successfully!");
            setConnectionId(data?.id);
            setStep(2);
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
      },
    });
  };

  const handleSaveSelections = async () => {
    if (!connectionId || selectedItems.length === 0) {
      toast.error("Please select at least one database/schema");
      return;
    }

    try {
      const selectedDatabases = [
        ...new Set(selectedItems.map((item) => item.split(".")[0])),
      ];
      const selectedSchemas = selectedItems.filter((i) => i.includes("."));

      await Promise.all([
        saveDatabaseSelection
          .mutateAsync({
            connection_id: connectionId,
            databases: selectedDatabases,
          })
          .catch((error) => {
            toast.error(parseErrorMessage(error));
          }),
        saveSchemaSelection
          .mutateAsync({
            connection_id: connectionId,
            schemas: selectedSchemas,
          })
          .catch((error) => {
            toast.error(parseErrorMessage(error));
          }),
      ]);

      toast.success("Database & schema selections saved!");
      router.push("/setup/repository");
    } catch {
      toast.error("Failed to save selections");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <Database className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-1">Database Setup</h1>
            <p className="text-sm text-muted-foreground">
              Connect your Snowflake warehouse to analyze query impacts
            </p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Database</span>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${step === 2
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  2
                </div>
                <span
                  className={`ml-2 text-sm ${step === 2 ? "font-medium" : "text-muted-foreground"
                    }`}
                >
                  Schema
                </span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Step {step}:{" "}
                {step === 1
                  ? "Enter Connection Details"
                  : "Select Databases & Schemas"}
                {connectionTested && step === 2 && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Currently supporting Snowflake."
                  : "Choose databases and schemas to analyze."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1 Form */}
              {step === 1 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Database Type</Label>
                      <Select defaultValue="snowflake" disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="snowflake">
                            <div className="flex items-center gap-2">
                              Snowflake
                              <Badge variant="secondary">Available</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Connection Name</Label>
                      <Input
                        placeholder="My Snowflake Connection"
                        {...register("connectionName")}
                      />
                      {errors.connectionName && (
                        <p className="text-red-500 text-sm">
                          {errors.connectionName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Account</Label>
                      <Input
                        placeholder="account.region"
                        {...register("account")}
                      />
                      {errors.account && (
                        <p className="text-red-500 text-sm">
                          {errors.account.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        {...register("username")}
                        placeholder="Username"
                        error={!!errors.username}
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        error={!!errors.password}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Warehouse</Label>
                      <Input
                        placeholder="COMPUTE_WH"
                        {...register("warehouse")}
                        error={!!errors.warehouse}
                      />
                      {errors.warehouse && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.warehouse.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Role</Label>
                      <Input
                        placeholder="ACCOUNTADMIN"
                        {...register("role")}
                        error={!!errors.role}
                      />
                      {errors.role && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.role.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Cron Expression</Label>
                      <Input
                        placeholder="* * * * *"
                        {...register("cron_expression")}
                        error={!!errors.cron_expression}
                      />
                      <div className="text-[11px] text-muted-foreground mt-1 h-4">
                        {explainCron(watch("cron_expression") || "")}
                      </div>
                      {errors.cron_expression && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cron_expression.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.root && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm border border-red-300">
                      {errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={testConnection.isPending || saveConnection.isPending}
                  >
                    {testConnection.isPending
                      ? "Testing Connection..."
                      : saveConnection.isPending
                        ? "Saving Connection..."
                        : "Test & Save Connection"}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Label>Select Databases and Schemas</Label>

                  {loadingDatabases ? (
                    <p className="text-sm text-muted-foreground">
                      Loading databases...
                    </p>
                  ) : (
                    <DatabaseTreeSelector
                      databases={databases}
                      selectedItems={selectedItems}
                      onSelectionChange={setSelectedItems}
                      connectionId={connectionId!}
                    />
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>

                    <Button
                      onClick={handleSaveSelections}
                      disabled={selectedItems.length === 0 || saveDatabaseSelection.isPending || saveSchemaSelection.isPending}
                      className="flex-1"
                    >
                      {saveDatabaseSelection.isPending || saveSchemaSelection.isPending
                        ? "Saving..."
                        : `Save & Next (${selectedItems.length} selected)`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
