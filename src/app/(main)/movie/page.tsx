import { redirect } from "next/navigation";

export default function MovieBasePage() {
  // If a user navigates to exactly "/movie" without an ID, 
  // instantly bounce them to the main Explore catalog.
  redirect("/movies");
}