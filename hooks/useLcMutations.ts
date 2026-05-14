import {
    changeStatusToDraft,
    changeStatusToIssued,
    changeStatusToRegected,
    createLc,
    deleteLc,
    sendLcToApproval,
    updateLc,
} from "@/lib/api/lc";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";

export function useLcMutations() {
    const createMutation = useMutation({
        mutationFn: createLc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка создания:", error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateLc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка обновления:", error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка удаления:", error);
        },
    });

    const sendToApprovalMutation = useMutation({
        mutationFn: sendLcToApproval,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка изменения статуса:", error);
        },
    });
    const approveMutation = useMutation({
        mutationFn: changeStatusToIssued,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка изменения статуса:", error);
        },
    });
    const rejectMutation = useMutation({
        mutationFn: changeStatusToRegected,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка изменения статуса:", error);
        },
    });

    const sendToDraftMutation = useMutation({
        mutationFn: changeStatusToDraft,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lcs"] });
        },
        onError: (error) => {
            console.error("Ошибка изменения статуса:", error);
        },
    });

    return {
        createMutation,
        deleteMutation,
        updateMutation,
        sendToApprovalMutation,
        approveMutation,
        rejectMutation,
        sendToDraftMutation,
    };
}
