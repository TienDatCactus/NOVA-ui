import { useInfiniteQuery } from "@tanstack/react-query";
import { ChatService } from "~/services/api/chat";

export function useStaffInbox({
  pageSize,
  page = 0,
}: {
  pageSize: number;
  page?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: async () =>
      await ChatService.getStaffInbox({
        page,
        pageSize,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
  });
}
