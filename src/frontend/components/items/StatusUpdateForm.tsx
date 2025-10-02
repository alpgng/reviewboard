// src/frontend/components/items/StatusUpdateForm.tsx
"use client";
import { useState } from "react";

interface StatusUpdateFormProps {
  itemId: string;
  onSuccess?: () => void;
}

export default function StatusUpdateForm({ itemId, onSuccess }: StatusUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          status: status
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Status güncellenirken bir hata oluştu');
      }
      
      // Başarılı olduğunda callback'i çağır
      if (onSuccess) {
        onSuccess();
      } else {
        // Callback yoksa sayfayı yenile
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        
        <button 
          onClick={() => updateStatus('IN_REVIEW')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100 "
        >
          Mark In-Review
        </button>
        <button 
          onClick={() => updateStatus('APPROVED')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100"
        >
          Approve
        </button>
        <button 
          onClick={() => updateStatus('REJECTED')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100"
        >
          Reject
        </button>
      </div>
    </div>
  );
}