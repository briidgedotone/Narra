import { NextResponse } from "next/server";

// import { scrapeCreatorsApi } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform") || "tiktok";
  const count = parseInt(searchParams.get("count") || "20");

  if (!handle) {
    return NextResponse.json(
      { success: false, error: "Handle parameter required" },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();

    // Clean the handle
    const cleanHandle = handle.replace(/[@\s]/g, "");

    // Temporary: Enhanced realistic mock data until ScrapeCreators API is available
    // This maintains the same interface so switching to real API will be seamless

    const duration = Date.now() - startTime;

    if (platform === "tiktok") {
      // Generate realistic TikTok posts for the creator
      const posts = Array.from({ length: Math.min(count, 24) }, (_, i) => {
        const postId = `${Date.now()}-${i}${Math.random().toString(36).substr(2, 9)}`;
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        const createTime = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

        // Realistic engagement patterns
        const baseViews = Math.floor(Math.random() * 500000) + 50000;
        const engagementRate = 0.03 + Math.random() * 0.05; // 3-8% engagement
        const likes = Math.floor(baseViews * engagementRate);
        const comments = Math.floor(likes * (0.05 + Math.random() * 0.1)); // 5-15% of likes
        const shares = Math.floor(likes * (0.02 + Math.random() * 0.08)); // 2-10% of likes

        // Realistic captions based on the creator
        const captions = [
          "Behind the scenes of my latest project! What do you think? 💭",
          "Day in my life as a content creator ✨ #GRWM #ContentCreator",
          "This took me way too long to figure out 😅 Can you relate?",
          "POV: You're trying something new and it actually works 🔥",
          "Rate my setup from 1-10! Drop your thoughts below 👇",
          "When someone asks me what I do for work... 💼 #CreatorLife",
          "Trying this viral trend because why not? 🤷‍♀️",
          "The before and after hits different 😱 #Transformation",
          "This is your sign to try something new today 💫",
          "Plot twist: it was harder than it looked 😳",
          "Responding to your questions! Keep them coming 💬",
          "This hack changed everything for me 🙌 #LifeHack",
        ];

        const caption = captions[i % captions.length];

        return {
          id: postId,
          embedUrl: `https://www.tiktok.com/@${cleanHandle}/video/${postId}`,
          caption: caption,
          thumbnail: `https://picsum.photos/400/600?random=${i + Date.now()}&blur=1`,
          transcript: `This is a realistic transcript for a TikTok video. ${caption.split("#")[0].trim()} The creator discusses various aspects of content creation, sharing personal insights and engaging with their audience. They mention tips for staying consistent, building authentic connections, and the importance of community engagement.`,
          metrics: {
            views: baseViews,
            likes: likes,
            comments: comments,
            shares: shares,
          },
          datePosted: new Date(createTime).toISOString(),
          platform: "tiktok",
          profile: {
            handle: cleanHandle,
            displayName:
              cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanHandle}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
            verified: [
              "iamsydneythomas",
              "khaby.lame",
              "mrbeast",
              "charlidamelio",
            ].includes(cleanHandle.toLowerCase()),
            followers: Math.floor(Math.random() * 5000000) + 100000,
          },
        };
      });

      return NextResponse.json({
        success: true,
        data: posts,
        cached: false,
        duration: `${duration}ms`,
        count: posts.length,
        note: "Enhanced mock data - will be replaced with real ScrapeCreators API when available",
      });
    } else {
      // Instagram placeholder
      return NextResponse.json({
        success: false,
        error: "Instagram posts not implemented yet",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
