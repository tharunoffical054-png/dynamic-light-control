import { createFileRoute } from "@tanstack/react-router";
import NoteVaultApp from "../components/NoteVaultApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoteVault | Secure Notes" },
      {
        name: "description",
        content: "Sign in to NoteVault to create, organize, and securely manage your notes.",
      },
      { property: "og:title", content: "NoteVault | Secure Notes" },
      {
        property: "og:description",
        content: "Create, organize, and securely manage your notes with NoteVault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <NoteVaultApp />;
}
