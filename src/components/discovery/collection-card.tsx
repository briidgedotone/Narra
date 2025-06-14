interface CollectionCardProps {
  title: string;
  description: string;
  username: string;
  authorInitial: string;
  authorBadgeColor: string;
  backgroundColor: string;
}

export function CollectionCard({
  title,
  description,
  username,
  authorInitial,
  authorBadgeColor,
  backgroundColor,
}: CollectionCardProps) {
  return (
    <div className="w-[488px] h-[152px] p-4 bg-[#F8F8F8] border-none rounded-xl overflow-hidden">
      <div className="flex h-full">
        <div
          className={`w-[120px] h-[120px] flex-shrink-0 rounded-md`}
          style={{ backgroundColor }}
        ></div>
        <div className="pl-4 flex-1 flex flex-col justify-start py-2">
          <h3 className="text-sm font-semibold mb-2">{title}</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>
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
        </div>
      </div>
    </div>
  );
}
