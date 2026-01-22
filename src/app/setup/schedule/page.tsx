"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CalendarClock, AlertCircle, CheckCircle } from "lucide-react";

import {
    scheduleSchema,
    ScheduleSchemaType,
} from "@/lib/validations/scheduleSchema";

import { explainCron } from "@/lib/cronUtils";

import { useSaveSchedule } from "@/hooks/useSchedule";

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
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ScheduleSetup() {
    const router = useRouter();
    const saveSchedule = useSaveSchedule();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ScheduleSchemaType>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            runs_every: "Custom cron",
            cron_string: "30 16 * * *",
            timezone: "Asia/Calcutta (GMT +05:30)", // Matching the screenshot default
        },
    });

    const cronString = watch("cron_string");

    const onSubmit = (values: ScheduleSchemaType) => {
        saveSchedule.mutate(values, {
            onSuccess: () => {
                toast.success("Schedule settings saved successfully!");
                router.push("/overview");
            },
            onError: () => {
                toast.error("Failed to save schedule settings.");
            },
        });
    };

    const handleRemoveSchedule = () => {
        setValue("cron_string", "");
        setValue("runs_every", "");
        toast.success("Schedule removed");
    }

    const handleSkip = () => {
        router.push("/overview");
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CalendarClock className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Schedule Settings</h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Configure how often your jobs should run to keep your data up to date.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        Schedule
                    </CardTitle>
                    <CardDescription>
                        Set the frequency and timezone for your automated tasks.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Runs Every */}
                            <div className="space-y-2">
                                <Label htmlFor="runs_every">Runs every <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="runs_every"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="runs_every" className={errors.runs_every ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Custom cron">Custom cron</SelectItem>
                                                <SelectItem value="Daily">Daily</SelectItem>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.runs_every && (
                                    <p className="text-red-500 text-xs">{errors.runs_every.message}</p>
                                )}
                            </div>

                            {/* Cron String */}
                            <div className="space-y-2">
                                <Label htmlFor="cron_string">Cron string <span className="text-red-500">*</span></Label>
                                <Input
                                    id="cron_string"
                                    placeholder="* * * * *"
                                    {...register("cron_string")}
                                    className={errors.cron_string ? "border-red-500" : ""}
                                />
                                {errors.cron_string && (
                                    <p className="text-red-500 text-xs">{errors.cron_string.message}</p>
                                )}
                            </div>

                            {/* Timezone */}
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="timezone"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="timezone" className={errors.timezone ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Calcutta (GMT +05:30)">Asia/Calcutta (GMT +05:30)</SelectItem>
                                                <SelectItem value="UTC">UTC (GMT +00:00)</SelectItem>
                                                <SelectItem value="America/New_York">America/New_York (GMT -05:00)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.timezone && (
                                    <p className="text-red-500 text-xs">{errors.timezone.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Preview Box - Mimicking the gray box in screenshot */}
                        {cronString && !errors.cron_string && (
                            <div className="bg-slate-50 border border-slate-100 rounded-md p-4 text-sm text-slate-700">
                                <div className="font-mono text-xs text-slate-500 mb-1">{cronString}</div>
                                <div className="font-medium">
                                    {explainCron(cronString)}
                                </div>
                            </div>
                        )}

                        {errors.root && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {errors.root.message}
                            </div>
                        )}

                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={handleRemoveSchedule}
                                >
                                    Remove schedule
                                </Button>

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="text-white min-w-[80px]"
                                        disabled={saveSchedule.isPending}
                                    >
                                        {saveSchedule.isPending ? "Saving..." : "Save"}
                                    </Button>
                                </div>
                            </div>

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
