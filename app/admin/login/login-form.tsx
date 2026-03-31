"use client"

import { useFormState } from "react-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError, SubmitButton } from "@/components/form-bits"
import { initialState } from "@/lib/action-state"
import { login } from "@/app/actions/admin"

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(login, initialState)
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" aria-invalid={!!state.errors?.password} />
        <FieldError state={state} name="password" />
      </div>
      <SubmitButton className="w-full" pendingText="Signing in...">
        Sign in
      </SubmitButton>
    </form>
  )
}
