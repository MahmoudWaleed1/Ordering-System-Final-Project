import { redirect } from "next/navigation";

export default function ProfilePreviewPage() {
  // Redirect back to the protected profile page so the preview is no longer publicly accessible
  redirect("/profile");
}

