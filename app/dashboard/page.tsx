"use client";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { status } = useSession();

  return <div>Dashboard {status}</div>;
}
