"use client";

import { MoreHorizontal } from "lucide-react";

import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import useBookingSchema from "~/services/schema/booking.schema";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomListItemSchema } = useRoomSchema();
type RoomCardProps = {
  room: z.infer<typeof RoomListItemSchema>;
};
function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="shadow-m">
      <CardHeader>
        <CardTitle>{room.roomName}</CardTitle>
        <CardDescription>{room.roomTypeName}</CardDescription>
        <CardAction>
          <Button variant="ghost" className="ml-auto">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default RoomCard;
