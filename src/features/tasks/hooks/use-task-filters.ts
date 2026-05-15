"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { taskQuerySchema } from "../schemas";
import type { TaskQuery, TaskStatus } from "../types";

type FilterUpdates = Partial<{
  status: TaskStatus | "ALL";
  sortBy: TaskQuery["sortBy"];
  order: TaskQuery["order"];
  page: number | "first";
}>;

export function useTaskFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<TaskQuery>(() => {
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = taskQuerySchema.safeParse(raw);
    return parsed.success ? parsed.data : taskQuerySchema.parse({});
  }, [searchParams]);

  const setFilters = useCallback(
    (updates: FilterUpdates) => {
      const params = new URLSearchParams(searchParams);
      let resetPage = false;

      if ("status" in updates) {
        const v = updates.status;
        if (v === undefined || v === null || v === "ALL") params.delete("status");
        else params.set("status", v);
        resetPage = true;
      }
      if (updates.sortBy !== undefined) {
        params.set("sortBy", updates.sortBy);
        resetPage = true;
      }
      if (updates.order !== undefined) {
        params.set("order", updates.order);
        resetPage = true;
      }

      if ("page" in updates && updates.page !== undefined && !resetPage) {
        const p = updates.page;
        if (p === "first" || (typeof p === "number" && p <= 1)) {
          params.delete("page");
        } else {
          params.set("page", String(p));
        }
      } else if (resetPage) {
        params.delete("page");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilters, clearFilters };
}
