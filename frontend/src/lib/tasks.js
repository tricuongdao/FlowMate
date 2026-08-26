import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import api from "./axios";

/** Read the API's error shape ({ message, details? }) into one string. */
export function apiError(error) {
  const data = error?.response?.data;
  return (
    data?.details && typeof data.details === "object"
      ? Object.values(data.details)[0]
      : data?.message
  ) || "Something went wrong. Please try again.";
}

const KEYS = {
  all: () => ["tasks"],
  list: (params) => ["tasks", params],
};

function taskParams({ status, filter, search, page }) {
  return {
    status,
    filter,
    ...(search ? { search } : {}),
    page,
    limit: 6,
  };
}

export function useTasks(params) {
  const query = useQuery({
    queryKey: KEYS.list(params),
    queryFn: async () => {
      const res = await api.get("/tasks", { params: taskParams(params) });
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
  return {
    ...query,
    tasks: query.data?.tasks ?? [],
    pagination:
      query.data?.pagination ??
      { page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    activeCount: query.data?.activeCount ?? 0,
    completeCount: query.data?.completeCount ?? 0,
  };
}

function useTaskMutation(mutationFn, { success, invalidate = true } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: success == null ? undefined : () => toast.success(success),
    onError: (error) => toast.error(apiError(error)),
    onSettled: () => {
      if (invalidate) qc.invalidateQueries({ queryKey: KEYS.all() });
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post("/tasks", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all() }),
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useUpdateTask() {
  return useTaskMutation(({ id, ...body }) => api.put(`/tasks/${id}`, body));
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    // Optimistic removal: the card collapses out instantly; a failure
    // rolls the list back and surfaces why.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.all() });
      const snapshot = qc.getQueriesData({ queryKey: KEYS.all() });
      for (const [key, data] of snapshot) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          tasks: data.tasks.filter((t) => t._id !== id),
        });
      }
      return { snapshot };
    },
    onError: (error, _id, ctx) => {
      for (const [key, data] of ctx.snapshot) qc.setQueryData(key, data);
      toast.error(apiError(error));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.all() }),
  });
}
