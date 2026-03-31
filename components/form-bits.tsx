"use client"

import type { ComponentProps } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActionState } from "@/lib/action-state"

export function SubmitButton({ children, pendingText, ...props }: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  )
}

export function FieldError({ state, name }: { state: ActionState; name: string }) {
  const message = state.errors?.[name]
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

export const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
