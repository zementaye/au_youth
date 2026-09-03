"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

/**
 * Reads a `?<param>=1` flag left by a server action's redirect, shows a
 * success toast once, then strips the param from the URL so refreshing or
 * navigating back doesn't re-trigger it.
 */
export default function RedirectToast({ param, message }: { param: string; message: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    if (searchParams.get(param) === "1") {
      showToast(message, "success");
      const params = new URLSearchParams(searchParams);
      params.delete(param);
      const query = params.toString();
      router.replace(query ? `?${query}` : window.location.pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
