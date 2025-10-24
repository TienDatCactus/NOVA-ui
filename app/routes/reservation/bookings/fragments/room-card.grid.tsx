"use client";

import { useState } from "react";

import { HeartIcon, MoreHorizontal } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
  CardContent,
  CardAction,
} from "~/components/ui/card";
import useBookingSchema from "~/services/schema/booking.schema";
import type z from "zod";

const { BookingItemByWeekSchema } = useBookingSchema();
type RoomCardProps = {
  booking: z.infer<typeof BookingItemByWeekSchema>;
};
function RoomCard({ booking }: RoomCardProps) {
  return (
    <Card className="shadow-m">
      <CardHeader>
        <CardTitle>{booking.roomName}</CardTitle>
        <CardDescription>{booking.roomTypeName}</CardDescription>
        <CardAction>
          <Button variant="ghost" className="ml-auto">
            <MoreHorizontal />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul>
          {booking.bookings.map((item) => (
            <li key={item.bookingId} className="mb-2">
              <div className="flex justify-between items-center"></div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default RoomCard;
