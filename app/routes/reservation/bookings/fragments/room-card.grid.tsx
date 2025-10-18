"use client";

import { useState } from "react";

import { HeartIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
  CardContent,
} from "~/components/ui/card";
import useBookingSchema from "~/services/schema/booking.schema";
import type z from "zod";

const { BookingItemByWeekSchema } = useBookingSchema();
type RoomCardProps = {
  booking: z.infer<typeof BookingItemByWeekSchema>;
};
function RoomCard({ booking }: RoomCardProps) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>{booking.roomName}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline">EU38</Badge>
          <Badge variant="outline">Black and White</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Crossing hardwood comfort with off-court flair. &apos;80s-Inspired
          construction, bold details and nothin&apos;-but-net style.
        </p>
      </CardContent>
      <CardFooter className="justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
        <div className="flex flex-col">
          <span className="text-sm font-medium uppercase">Price</span>
          <span className="text-xl font-semibold">$69.99</span>
        </div>
        <Button size="lg">Add to cart</Button>
      </CardFooter>
    </Card>
  );
}

export default RoomCard;
