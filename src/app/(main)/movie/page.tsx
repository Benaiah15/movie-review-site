import { redirect } from "next/navigation";

export const revalidate = 60; // Updates the cache every 60 seconds
export default function MovieBasePage() {
  // If a user navigates to exactly "/movie" without an ID, 
  // instantly bounce them to the main Explore catalog.
  redirect("/movies");
}