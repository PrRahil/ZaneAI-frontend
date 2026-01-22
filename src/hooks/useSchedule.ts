import { useMutation } from "@tanstack/react-query";
import { ScheduleSchemaType } from "@/lib/validations/scheduleSchema";

const mockApiSave = async (payload: ScheduleSchemaType) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, data: payload });
        }, 1000);
    });
};

export const useSaveSchedule = () =>
    useMutation<any, Error, ScheduleSchemaType>({
        mutationFn: async (payload) => {
            const res = await mockApiSave(payload);
            return res;
        },
        onError: (error) => {
            console.error("Save Schedule error:", error);
        },
    });
