"use client";

import { useParams } from "next/navigation";
import JewelryStorePage from "@/components/jewelry/JewelryStorePage";

export default function JewelryStoreRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <JewelryStorePage username={slug} />;
}
