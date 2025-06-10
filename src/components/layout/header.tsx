import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          {title && (
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          )}
        </div>
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
