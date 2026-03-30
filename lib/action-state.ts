import type { ZodTypeAny, output } from "zod"

export type ActionState = {
  ok: boolean
  message?: string
  errors?: Record<string, string>
  /** Extra data returned by an action, e.g. a freshly generated API key */
  data?: Record<string, string>
}

export const initialState: ActionState = { ok: false }

export function parseForm<S extends ZodTypeAny>(
  schema: S,
  formData: FormData,
): { success: true; data: output<S> } | { success: false; state: ActionState } {
  const result = schema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success) return { success: true, data: result.data }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "form"
    errors[key] ??= issue.message
  }
  return { success: false, state: { ok: false, message: "Please fix the highlighted fields.", errors } }
}
