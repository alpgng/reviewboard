// src/frontend/components/items/StatusUpdateModal.tsx
"use client";
import { useState } from "react";
import Modal from "@/frontend/components/ui/Modal";
import StatusUpdateForm from "@/frontend/components/items/StatusUpdateForm";
import type { ItemDTO } from "@/types";

interface StatusUpdateModalProps {
  item: ItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusUpdateModal({ item, isOpen, onClose }: StatusUpdateModalProps) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Durum Güncelle: ${item.title}`}
    >
      <div className="py-2">
        <p className="mb-4 text-sm text-gray-600">
          Bu öğenin durumunu güncellemek için aşağıdaki seçeneklerden birini seçin:
        </p>
        <StatusUpdateForm 
          itemId={item.id} 
          onSuccess={() => {
            onClose();
            // Sayfayı yenilemek yerine, başarılı olduğunda modalı kapat
            window.location.reload();
          }} 
        />
      </div>
    </Modal>
  );
}