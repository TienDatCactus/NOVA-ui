import React from "react";
import { Outlet } from "react-router";
import type { Route } from "./+types/trip.layout";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Asalam malaykum," },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
const trip: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default trip;
