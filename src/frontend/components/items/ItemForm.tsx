"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/frontend/components/ui/Button";
import Input from "@/frontend/components/ui/Input";


export default function ItemForm() {
const router = useRouter();
const [loading, setLoading] = useState(false);


async function onSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();
const form = e.currentTarget as HTMLFormElement;
const formData = new FormData(form);


const payload = {
title: String(formData.get("title") || "").trim(),
description: String(formData.get("description") || "").trim(),
amount: Number(formData.get("amount") || 0),
tags: String(formData.get("tags") || "")
.split(",")
.map((t) => t.trim())
.filter(Boolean),
};


setLoading(true);
try {
const res = await fetch("/api/items", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
if (!res.ok) throw new Error("Create failed");
form.reset();
router.refresh();
} catch (err) {
console.error(err);
alert("Item oluşturulamadı");
} finally {
setLoading(false);
}
}


return (
<form onSubmit={onSubmit} className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
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