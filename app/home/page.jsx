import { permanentRedirect } from "next/navigation";

// The starter served the landing page at both / and /home. /home now
// redirects to / (also in public/_redirects for Netlify) to avoid duplicate content.
export default function HomeRedirect() {
  permanentRedirect("/");
}
