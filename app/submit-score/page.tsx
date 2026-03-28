import { redirect } from "next/navigation"

// Scores are now submitted through the API, or manually from the admin dashboard
export default function SubmitScorePage() {
  redirect("/admin")
}
