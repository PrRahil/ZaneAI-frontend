"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Cloud } from "lucide-react";

import {
    dbtCloudSchema,
    DbtCloudSchemaType,
} from "@/lib/validations/dbtCloudSchema";

import {
    useTestDbtCloudConnection,
    useSaveDbtCloudConnection,
} from "@/hooks/useDbtCloud";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseErrorMessage } from "@/hooks/useAuth";

interface EditDbtCloudModalProps {
    open: boolean;
    onClose: () => void;
    connectionData: any;
}

export default function EditDbtCloudModal({
    open,
    onClose,
    connectionData,
}: EditDbtCloudModalProps) {
    const testConnection = useTestDbtCloudConnection();
    const saveConnection = useSaveDbtCloudConnection();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        setError,
        formState: { errors },
    } = useForm<DbtCloudSchemaType>({
        resolver: zodResolver(dbtCloudSchema)
    });

    useEffect(() => {
        if (open) {
            if (connectionData) {
                setValue("connection_name", connectionData.connection_name);
                setValue("base_url", connectionData.base_url);
                setValue("account_id", connectionData.account_id);
                setValue("api_key", "");
            } else {
                reset();
                setValue("connection_name", "DBT Cloud");
            }
        }
    }, [connectionData, open, setValue, reset]);

    const onSubmit = (values: DbtCloudSchemaType) => {
        const payload = values;

        testConnection.mutate(payload, {
            onSuccess: () => {
                saveConnection.mutate(payload, {
                    onSuccess: (data) => {
                        toast.success("DBT Cloud connection saved successfully!");
                        onClose();
                    },
                    onError: (error) => {
                        const message = parseErrorMessage(error);
                        toast.error("Failed to save DBT Cloud connection");
                        setError("root", { message });
                    },
                });
            },
            onError: (error) => {
                const msg = parseErrorMessage(error);
                setError("root", { message: msg });
                toast.error(msg || "DBT Cloud Connection test failed");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-orange-500" />
                        {connectionData ? "Edit" : "Add"} DBT Cloud Connection
                    </DialogTitle>
                    <DialogDescription>
                        Connect to your dbt Cloud account to sync jobs and run history.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
                    <div className="grid gap-5">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Connection Name
                            </Label>
                            <Input
                                placeholder="My DBT Cloud"
                                {...register("connection_name")}
                            />
                            {errors.connection_name && (
                                <p className="text-red-500 text-sm">{errors.connection_name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Base URL
                            </Label>
                            <Input
                                placeholder="https://cloud.getdbt.com"
                                {...register("base_url")}
                            />
                            {errors.base_url && (
                                <p className="text-red-500 text-sm">{errors.base_url.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Account ID
                                </Label>
                                <Input
                                    placeholder="123456"
                                    {...register("account_id")}
                                />
                                {errors.account_id && (
                                    <p className="text-red-500 text-sm">{errors.account_id.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Service Token / API Key
                                </Label>
                                <Input
                                    type="password"
                                    placeholder="dbt_..."
                                    {...register("api_key")}
                                />
                                {errors.api_key && (
                                    <p className="text-red-500 text-sm">{errors.api_key.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {errors.root && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-destructive" />
                            {errors.root.message}
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={testConnection.isPending || saveConnection.isPending}
                        >
                            {testConnection.isPending
                                ? "Testing Connection..."
                                : saveConnection.isPending
                                    ? "Saving..."
                                    : "Save Connection"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
