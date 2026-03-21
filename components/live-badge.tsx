import type { ConnectionStatus } from "./use-event-source"
import { cn } from "@/lib/utils"

const LABELS: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
}

export function LiveBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
      role="status"
      aria-live="polite"
      data-status={status}
    >
      <span className="relative flex h-2.5 w-2.5">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            status === "live" ? "bg-green-500" : "bg-amber-500",
          )}
        />
      </span>
      {LABELS[status]}
    </span>
  )
}
