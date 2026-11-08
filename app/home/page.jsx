import { permanentRedirect } from "next/navigation";

// The starter served the landing page at both / and /home. /home now
// redirects to / (also configured in next.config.mjs) to avoid duplicate content.
export default function HomeRedirect() {
  permanentRedirect("/");
}
