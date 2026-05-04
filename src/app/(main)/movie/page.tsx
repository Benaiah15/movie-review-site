import { redirect } from "next/navigation";

export const revalidate = 3600; // Updates the cache every 3600 seconds
export default function MovieBasePage() {
  // If a user navigates to exactly "/movie" without an ID, 
  // instantly bounce them to the main Explore catalog.
  redirect("/movies");
}