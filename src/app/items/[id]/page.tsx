"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ItemPage() {
  // Next.js 15.x'te dinamik parametreleri useParams hook'u ile alıyoruz
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ID değiştiğinde kontrol edelim
  useEffect(() => {
    if (!id) {
      console.error("Item ID not found");
    }
  }, [id]);

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
          id: id,
          status: status
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Status güncellenirken bir hata oluştu');
      }
      
      // Başarılı olduğunda sayfayı yenileyelim
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return <div>Item ID not found</div>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button 
          onClick={() => updateStatus('IN_REVIEW')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100 hover:scale-110"
        >
          Mark In-Review
        </button>
        <button 
          onClick={() => updateStatus('APPROVED')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100 hover:scale-110"
        >
          Approve
        </button>
        <button 
          onClick={() => updateStatus('REJECTED')} 
          disabled={loading}
          className="rounded-xl border px-3 py-1 hover:bg-gray-100 hover:scale-110"
        >
          Reject
        </button>
      </div>
    </div>
  );
}