import { useState, useMemo } from "react";
import { useStaffInbox } from "./query.hooks";
import type { StaffInboxItemDto } from "~/services/api/chat/dto";

export type InboxFilters = {
  searchQuery: string;
  status: "all" | "active" | "closed";
  assigned: "all" | "assigned" | "unassigned";
};

export function useStaffInboxContainer() {
  const [filters, setFilters] = useState<InboxFilters>({
    searchQuery: "",
    status: "all",
    assigned: "all",
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  // Fetch inbox with infinite scroll
  const {
    data: inboxData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useStaffInbox({ pageSize: 20 });

  // Flatten pages into single array
  const allConversations = useMemo<StaffInboxItemDto[]>(() => {
    if (!inboxData?.pages) return [];
    return inboxData.pages.flatMap((page) => page.items);
  }, [inboxData]);

  // Apply filters
  const filteredConversations = useMemo(() => {
    return allConversations.filter((conv) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          conv.roomName.toLowerCase().includes(query) ||
          conv.customerName.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "active" && conv.status !== "Active")
          return false;
        if (filters.status === "closed" && conv.status !== "Closed")
          return false;
      }

      // Assigned filter
      if (filters.assigned !== "all") {
        if (filters.assigned === "assigned" && !conv.assignedStaffId)
          return false;
        if (filters.assigned === "unassigned" && conv.assignedStaffId)
          return false;
      }

      return true;
    });
  }, [allConversations, filters]);

  // Get selected conversation
  const selectedConversation = useMemo(() => {
    if (!selectedSessionId) return null;
    return allConversations.find((c) => c.sessionId === selectedSessionId);
  }, [selectedSessionId, allConversations]);

  // Update individual filter
  const updateFilter = <K extends keyof InboxFilters>(
    key: K,
    value: InboxFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      status: "all",
      assigned: "all",
    });
  };

  return {
    conversations: filteredConversations,
    selectedConversation,
    selectedSessionId,
    setSelectedSessionId,
    filters,
    updateFilter,
    resetFilters,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    totalCount: inboxData?.pages[0]?.totalCount || 0,
  };
}
