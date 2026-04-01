"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useFormState } from "react-dom"
import { Copy, KeyRound, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FieldError, SubmitButton, selectClass } from "@/components/form-bits"
import { initialState, type ActionState } from "@/lib/action-state"
import { createGame, deleteGame, rotateApiKey, submitScoreAsAdmin } from "@/app/actions/admin"

/** Shows a freshly generated API key once, with a copy button. */
function ApiKeyNotice({ state }: { state: ActionState }) {
  if (!state.ok || !state.data?.apiKey) return null
  const key = state.data.apiKey
  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm" data-testid="api-key">
      <p className="mb-2 font-medium">API key for {state.data.name} — copy it now, it will not be shown again:</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 break-all rounded bg-background p-2 font-mono text-xs" data-key={key}>
          {key}
        </code>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Copy API key"
          onClick={() => navigator.clipboard.writeText(key).then(() => toast.success("Copied"))}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function useToastAndReset(state: ActionState, reset = true) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
      if (reset) ref.current?.reset()
    }
  }, [state, reset])
  return ref
}

export function CreateGameForm() {
  const [state, action] = useFormState(createGame, initialState)
  const ref = useToastAndReset(state)

  return (
    <div className="space-y-4">
      <form ref={ref} action={action} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Space Invaders" aria-invalid={!!state.errors?.name} />
          <FieldError state={state} name="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input id="description" name="description" placeholder="Classic arcade shooter" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Ranking</Label>
            <select id="sortOrder" name="sortOrder" defaultValue="HIGHER_IS_BETTER" className={selectClass}>
              <option value="HIGHER_IS_BETTER">Highest score wins</option>
              <option value="LOWER_IS_BETTER">Lowest score wins (times)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" placeholder="points" />
          </div>
        </div>
        <SubmitButton pendingText="Creating...">Create game</SubmitButton>
      </form>
      <ApiKeyNotice state={state} />
    </div>
  )
}

export function AdminScoreForm({ games }: { games: { id: string; name: string; unit: string }[] }) {
  const [state, action] = useFormState(submitScoreAsAdmin, initialState)
  const ref = useToastAndReset(state)

  return (
    <form ref={ref} action={action} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="gameId">Game</Label>
        <select id="gameId" name="gameId" className={selectClass} defaultValue={games[0]?.id}>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.unit})
            </option>
          ))}
        </select>
        <FieldError state={state} name="gameId" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="player">Player</Label>
          <Input id="player" name="player" placeholder="Sarah" aria-invalid={!!state.errors?.player} />
          <FieldError state={state} name="player" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Score</Label>
          <Input id="value" name="value" type="number" step="any" placeholder="1200" aria-invalid={!!state.errors?.value} />
          <FieldError state={state} name="value" />
        </div>
      </div>
      <SubmitButton pendingText="Saving...">Add score</SubmitButton>
    </form>
  )
}

export function RotateKeyForm({ gameId }: { gameId: string }) {
  const [state, action] = useFormState(rotateApiKey, initialState)
  const [open, setOpen] = useState(false)
  useToastAndReset(state, false)
  useEffect(() => {
    if (state.ok) setOpen(true)
  }, [state])

  return (
    <>
      <form action={action}>
        <input type="hidden" name="gameId" value={gameId} />
        <SubmitButton size="sm" variant="outline" aria-label="New API key">
          <KeyRound className="mr-1 h-4 w-4" />
          New key
        </SubmitButton>
      </form>
      {open && (
        <div className="w-full">
          <ApiKeyNotice state={state} />
        </div>
      )}
    </>
  )
}

export function DeleteGameButton({ gameId, name }: { gameId: string; name: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="text-destructive" aria-label={`Delete ${name}`} disabled={pending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            All of its scores are deleted and its API key stops working. Viewers are notified live.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() =>
              startTransition(async () => {
                await deleteGame(gameId)
                toast.success(`${name} deleted`)
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
