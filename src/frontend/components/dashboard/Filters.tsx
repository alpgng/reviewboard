"use client";
import Select from "@/frontend/components/ui/Select";
import Link from "next/link";
import { Status } from "@/types";

interface FiltersProps {
  selectedStatus?: Status;
  selectedTag?: string;
  selectedMinScore?: number;
  onFilterChange?: (filters: { status?: string; tag?: string; minScore?: string }) => void;
}

export default function Filters({
  selectedStatus = undefined,
  selectedTag = "",
  selectedMinScore = 0,
  onFilterChange = () => {}
}: FiltersProps) {
  
  function handleStatusChange(value: string) {
    onFilterChange({ status: value || undefined });
  }

  function handleTagChange(value: string) {
    onFilterChange({ tag: value || undefined });
  }

  function handleMinScoreChange(value: string) {
    onFilterChange({ minScore: value || undefined });
  }

  function handleClearFilters() {
    onFilterChange({ status: undefined, tag: undefined, minScore: undefined });
  }

  return (
    <div className="filters">
      <div>
        <label className="filters-label">Status</label>
        <Select 
          value={selectedStatus || ""} 
          onChange={(e) => handleStatusChange(e.currentTarget.value)}
        >
          <option value="">All</option>
          <option value="NEW">New</option>
          <option value="IN_REVIEW">In-Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>
      <div>
        <label className="filters-label">Tag</label>
        <input
          className="input"
          placeholder="e.g. fintech"
          value={selectedTag || ""}
          onChange={(e) => handleTagChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTagChange((e.target as HTMLInputElement).value);
          }}
        />
      </div>
      <div>
        <label className="filters-label">Min Score</label>
        <input
          type="number"
          className="input w-28"
          placeholder="0"
          value={selectedMinScore || ""}
          onChange={(e) => handleMinScoreChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleMinScoreChange((e.target as HTMLInputElement).value);
          }}
        />
      </div>
      <button 
        className="ml-auto link" 
        onClick={handleClearFilters}
      >
        Clear filters
      </button>
    </div>
  );
}
