"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ItemForm from "@/frontend/components/items/ItemForm";
import ItemList from "@/frontend/components/items/ItemList";
import Filters from "@/frontend/components/dashboard/Filters";
import { Status, ItemDTO } from "@/types";

export default function DashboardContent() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    status: undefined as string | undefined,
    tag: undefined as string | undefined,
    minScore: undefined as string | undefined,
  });

  // Öğeleri getir
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const qs = new URLSearchParams();
        if (searchParams.status) qs.set("status", searchParams.status);
        if (searchParams.tag) qs.set("tag", searchParams.tag);
        if (searchParams.minScore) qs.set("minScore", searchParams.minScore);

        const res = await fetch(`/api/items${qs.toString() ? `?${qs.toString()}` : ""}`);
        if (!res.ok) throw new Error("Failed to fetch items");
        
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [searchParams]);

  // Filtre değişikliklerini işle
  const handleFilterChange = (filters: {
    status?: string;
    tag?: string;
    minScore?: string;
  }) => {
    setSearchParams((prev) => ({
      ...prev,
      ...filters,
    }));
  };

  // Yükleniyor durumu
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ReviewBoard</h1>
        <div>
          <span className="mr-4">Merhaba, {session?.user?.name || "Kullanıcı"}</span>
          <a className="underline" href="/api/auth/signout?callbackUrl=/">Çıkış Yap</a>
        </div>
      </div>

      <ItemForm />
      <Filters 
        selectedStatus={searchParams.status as Status | undefined}
        selectedTag={searchParams.tag}
        selectedMinScore={searchParams.minScore ? parseInt(searchParams.minScore) : 0}
        onFilterChange={handleFilterChange}
      />
   
      <ItemList items={items} />
    </div>
  );
}