"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // useSession ekle
import Button from "@/frontend/components/ui/Button";
import Input from "@/frontend/components/ui/Input";


export default function ItemForm() {
const router = useRouter();
const { data: session } = useSession(); // Oturum bilgilerini al
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);


async function onSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();
const form = e.currentTarget as HTMLFormElement;
const formData = new FormData(form);

// Reset states
setError(null);
setSuccess(false);

// Kullanıcı ID'sini kontrol et
const userId = session?.user?.id;

if (!userId) {
  setError("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
  return;
}

const payload = {
title: String(formData.get("title") || "").trim(),
description: String(formData.get("description") || "").trim(),
amount: Number(formData.get("amount") || 0),
tags: String(formData.get("tags") || "")
.split(",")
.map((t) => t.trim())
.filter(Boolean),
userId, // User ID'sini doğrudan gönder
};


setLoading(true);
try {
const res = await fetch("/api/items", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
credentials:"include",
});

const data = await res.json();

if (!res.ok) {
  const errorMessage = data.details || data.error || "Item oluşturulamadı";
  console.error("Item creation error:", errorMessage);
  setError(errorMessage);
  throw new Error(errorMessage);
}

form.reset();
setSuccess(true);
setTimeout(() => {
  setSuccess(false);
}, 3000); // 3 saniye sonra başarı mesajını kaldır

// Sayfayı yenilemek yerine veri getirmeyi tetikle
router.refresh();
} catch (err) {
if (err instanceof Error) {
  console.error("Item creation error:", err.message);
} else {
  console.error("Item creation error:", String(err));
}

if (!error) setError("Item oluşturulamadı. Lütfen tekrar deneyin.");
} finally {
setLoading(false);
}
}


return (
<form onSubmit={onSubmit} className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
{error && (
  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
    {error}
  </div>
)}
{success && (
  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
    Item başarıyla oluşturuldu!
  </div>
)}
<div className="grid gap-3 sm:grid-cols-2">
<div>
<label className="mb-1 block text-[color:var(--color-text-black)] text-sm font-medium">Title</label>
<Input name="title" placeholder="e.g. Annual contract review" required />
</div>
<div>
<label className="mb-1 block text-[color:var(--color-text-black)] text-sm font-medium">Amount</label>
<Input name="amount" type="number" step="0.01" min="0" placeholder="10000" required />
</div>
</div>
<div>
<label className="mb-1 block text-[color:var(--color-text-black)] text-sm font-medium">Description</label>
<Input name="description" placeholder="Short context" />
</div>
<div>
<label className="mb-1 block text-[color:var(--color-text-black)] text-sm font-medium">Tags (comma separated)</label>
<Input  name="tags"  placeholder="fintech,urgent,partner-x" />
</div>
<div className="flex items-center justify-end gap-3">
<Button type="submit" disabled={loading}>
{loading ? "Saving…" : "Add Item"}
</Button>
</div>
</form>
);
}