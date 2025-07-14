"use client";

import Link from "next/link";

interface CollectionCardProps {
  title: string;
  description: string;
  username: string;
  authorInitial: string;
  authorBadgeColor: string;
  backgroundColor: string;
  boardId?: string | undefined; // Optional board ID for navigation
  coverImageUrl?: string | undefined; // Optional cover image URL
}

export function CollectionCard({
  title,
  description,
  username,
  authorInitial,
  authorBadgeColor,
  backgroundColor,
  boardId,
  coverImageUrl,
}: CollectionCardProps) {
  const cardContent = (
    <div className="w-[488px] h-[152px] p-4 bg-[#F8F8F8] border-none rounded-xl overflow-hidden hover:bg-[#F0F0F0] transition-colors">
      <div className="flex h-full">
        <div
          className={`w-[120px] h-[120px] flex-shrink-0 rounded-md overflow-hidden`}
          style={{
            backgroundColor: coverImageUrl ? "transparent" : backgroundColor,
            backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Hidden image element for error handling */}
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt=""
              className="hidden"
              onError={e => {
                // If the image fails to load, fallback to background color
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.backgroundImage = "none";
                  parent.style.backgroundColor = backgroundColor;
                }
              }}
            />
          )}
        </div>
        <div className="pl-4 flex-1 flex flex-col justify-start py-2">
          <h3 className="text-sm font-semibold mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>
          {username && (
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full ${authorBadgeColor} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-semibold">
                  {authorInitial}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If boardId is provided, make it clickable and navigate to the board
  if (boardId) {
    return (
      <Link href={`/boards/${boardId}`} className="block">
        {cardContent}
      </Link>
    );
  }

  // Otherwise, return the static card
  return cardContent;
}
