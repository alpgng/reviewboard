"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface AuditDTO {
  id: string;
  action: string;
  createdAt: string;
  userId: string;
  itemId: string;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

interface ItemAuditHistoryProps {
  itemId: string;
}

export default function ItemAuditHistory({ itemId }: ItemAuditHistoryProps) {
  const [audits, setAudits] = useState<AuditDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/audits?itemId=${itemId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch audit history");
        }
        
        const data = await response.json();
        setAudits(data.map((audit: {
          id: string;
          action: string;
          createdAt: string;
          userId: string;
          itemId: string;
          user?: {
            name?: string | null;
            email?: string | null;
          };
        }) => ({
          id: audit.id,
          action: audit.action,
          createdAt: audit.createdAt,
          userId: audit.userId,
          itemId: audit.itemId,
          user: {
            name: audit.user?.name,
            email: audit.user?.email
          }
        })));
      } catch (err) {
        console.error("Error fetching audit history:", err);
        setError("Failed to load audit history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudits();
  }, [itemId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading audit history...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (audits.length === 0) {
    return <div className="text-center py-4 text-gray-500">No audit history available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {audits.map((audit) => (
          <div key={audit.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{audit.action}</div>
                <div className="text-sm text-gray-600">
                  By {audit.user.name || audit.user.email || "Unknown user"}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(audit.createdAt), { 
                  addSuffix: true,
                  locale: tr 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
