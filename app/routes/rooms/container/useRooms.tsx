import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";

function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => await RoomsService.getRoomList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

export default useRooms;
