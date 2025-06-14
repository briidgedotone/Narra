import Image from "next/image";

interface CollectionCardProps {
  title: string;
  description: string;
  authorName: string;
  authorInitial: string;
  authorBadgeColor: string;
  imageUrl: string;
  gradientFrom: string;
  gradientTo: string;
}

export function CollectionCard({
  title,
  description,
  authorName,
  authorInitial,
  authorBadgeColor,
  imageUrl,
  gradientFrom,
  gradientTo,
}: CollectionCardProps) {
  return (
    <div className="w-[488px] h-[152px] p-4 bg-[#F8F8F8] border-none rounded-lg overflow-hidden">
      <div className="flex h-full">
        <div
          className={`w-[120px] h-[120px] bg-gradient-to-br ${gradientFrom} ${gradientTo} flex-shrink-0 rounded-lg`}
        >
          <Image
            src={imageUrl}
            alt={authorName}
            width={120}
            height={120}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="pl-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full ${authorBadgeColor} flex items-center justify-center`}
            >
              <span className="text-white text-xs font-semibold">
                {authorInitial}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{authorName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
