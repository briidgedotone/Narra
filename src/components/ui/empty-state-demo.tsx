import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  Link,
  Files,
  Search,
  MessageSquare,
  Mail,
  Image,
  FileQuestion,
  Settings,
  Bookmark,
  Heart,
  Clipboard,
} from "@/components/ui/icons";

function EmptyStateDefault() {
  return (
    <EmptyState
      title="No Posts Saved"
      description="Start discovering content and save posts to this board to see them here."
      icons={[FileText, Link, Files]}
      action={{
        label: "Discover Content",
        onClick: () => console.log("Discover content clicked"),
      }}
    />
  );
}

function EmptyStateMessages() {
  return (
    <EmptyState
      title="No Messages"
      description="Start a conversation by sending a message."
      icons={[MessageSquare, Mail]}
      action={{
        label: "Send Message",
        onClick: () => console.log("Send message clicked"),
      }}
    />
  );
}

function EmptyStateSearch() {
  return (
    <EmptyState
      title="No Results Found"
      description="Try adjusting your search filters or search for different content."
      icons={[Search, FileQuestion]}
    />
  );
}

function EmptyStateMedia() {
  return (
    <EmptyState
      title="No Images"
      description="Upload images to get started with your gallery."
      icons={[Image]}
      action={{
        label: "Upload Images",
        onClick: () => console.log("Upload clicked"),
      }}
    />
  );
}

function EmptyStateSettings() {
  return (
    <EmptyState
      title="No Settings"
      description="Configure your application settings to get started."
      icons={[Settings]}
      action={{
        label: "Configure",
        onClick: () => console.log("Configure clicked"),
      }}
    />
  );
}

function EmptyStateBoards() {
  return (
    <EmptyState
      title="No Boards Created"
      description="Create your first board to start organizing your saved content."
      icons={[Clipboard, Bookmark, Heart]}
      action={{
        label: "Create Board",
        onClick: () => console.log("Create board clicked"),
      }}
    />
  );
}

export {
  EmptyStateDefault,
  EmptyStateMessages,
  EmptyStateSearch,
  EmptyStateMedia,
  EmptyStateSettings,
  EmptyStateBoards,
};
