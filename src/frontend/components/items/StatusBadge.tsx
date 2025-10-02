import type { Status } from "@/types";

function statusToClass(status: Status) {
  switch (status) {
    case "NEW":        return "badge badge-new";
    case "IN_REVIEW":  return "badge badge-inreview";
    case "APPROVED":   return "badge badge-approved";
    case "REJECTED":   return "badge badge-rejected";
    default:           return "badge";
  }
}

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={statusToClass(status)}>{status.replace("_", "-")}</span>;
}
