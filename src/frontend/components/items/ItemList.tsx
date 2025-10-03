// src/frontend/components/items/ItemList.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import StatusUpdateModal from "./StatusUpdateModal";
import ItemAuditHistory from "@/frontend/components/audit/ItemAuditHistory";
import type { ItemDTO } from "@/types";

interface ItemListProps {
  items: ItemDTO[];
}

export default function ItemList({ items: initialItems }: ItemListProps) {
  const [items, setItems] = useState<ItemDTO[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<ItemDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openModal = (item: ItemDTO) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleDetails = (itemId: string) => {
    if (showDetails === itemId) {
      setShowDetails(null);
    } else {
      setShowDetails(itemId);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Öğe silinirken bir hata oluştu");
      }

      // Başarılı silme işleminden sonra öğeyi listeden kaldır
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Bir hata oluştu");
      console.error("Error deleting item:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!items || items.length === 0) {
    return <div className="empty">Henüz öğe yok.</div>;
  }

  return (
    <>
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{deleteError}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="table">
          <thead className="thead">
            <tr>
              <th className="th color-[color:var(--color-text-black)]">
                Title
              </th>
              <th className="th color-[color:var(--color-text-black)]">
                Amount
              </th>
              <th className="th color-[color:var(--color-text-black)]">Tags</th>
              <th className="th color-[color:var(--color-text-black)]">
                Score
              </th>
              <th className="th color-[color:var(--color-text-black)]">
                Status
              </th>
              <th
                className="th color-[color:var(--color-text-black)]"
                colSpan={2}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="tr">
                  <td className="td font-medium color-[color:var(--color-text-black)]">
                    {item.title}
                  </td>
                  <td className="td color-[color:var(--color-text-black)]">
                    $ {item.amount.toLocaleString()}
                  </td>
                  <td className="td color-[color:var(--color-text-black)]">
                    {item.tags.join(", ")}
                  </td>
                  <td className="td color-[color:var(--color-text-black)]">
                    {item.risk_score}
                  </td>
                  <td className="td color-[color:var(--color-text-black)]">
                    <button
                      onClick={() => openModal(item)}
                      className="inline-block"
                    >
                      <StatusBadge status={item.status} />
                    </button>
                  </td>
                  <td className="td text-right color-[color:var(--color-text-black)]">
                    <button
                      onClick={() => toggleDetails(item.id)}
                      className="link mr-2"
                    >
                      {showDetails === item.id
                        ? "Hide Details"
                        : "Show Details"}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Siliniyor..." : "Sil"}
                    </button>
                  </td>
                </tr>
                {showDetails === item.id && (
                  <tr className="tr bg-gray-50">
                    <td colSpan={6} className="td p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Description</h3>
                        <p className="text-sm">
                          {item.description || "No description provided."}
                        </p>
                        <div className="mt-3">
                          <div className="text-sm">
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Last Updated:</span>{" "}
                            {new Date(item.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <h3 className="font-medium">Audit History</h3>
                          <ItemAuditHistory itemId={item.id} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
