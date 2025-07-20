import { NextRequest, NextResponse } from "next/server";
import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

function extractInstagramShortcode(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check if it's an Instagram URL
    if (!urlObj.hostname.includes('instagram.com')) {
      return null;
    }
    
    // Match patterns like /p/shortcode/ or /reel/shortcode/
    const match = urlObj.pathname.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
    if (match && match[2]) {
      return match[2];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function validateInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('instagram.com') && 
           /\/(p|reel|tv)\/[a-zA-Z0-9_-]+/.test(urlObj.pathname);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postUrl = searchParams.get('url');

    if (!postUrl) {
      return NextResponse.json(
        { success: false, error: 'Post URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!validateInstagramUrl(postUrl)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Instagram URL. Please provide a valid Instagram post, reel, or TV URL.' 
        },
        { status: 400 }
      );
    }

    // Extract shortcode for additional validation
    const shortcode = extractInstagramShortcode(postUrl);
    if (!shortcode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not extract post ID from URL.' 
        },
        { status: 400 }
      );
    }

    // Call ScrapeCreators API
    const response = await scrapeCreatorsApi.instagram.getIndividualPost(postUrl);

    if (!response.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Failed to fetch post data',
          cached: response.cached 
        },
        { status: 500 }
      );
    }

    // Transform the response to a more usable format
    const rawData = response.data;
    const postData = rawData?.data?.xdt_shortcode_media;

    if (!postData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No post data found in response' 
        },
        { status: 404 }
      );
    }

    // Transform to our internal format
    const transformedPost = {
      id: postData.id,
      shortcode: postData.shortcode,
      url: `https://www.instagram.com/p/${postData.shortcode}/`,
      caption: postData.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      isVideo: postData.is_video,
      displayUrl: postData.display_url,
      videoUrl: postData.video_url,
      thumbnail: postData.thumbnail_src,
      dimensions: postData.dimensions,
      metrics: {
        likes: postData.edge_media_preview_like?.count || 0,
        comments: postData.edge_media_to_parent_comment?.count || 0,
        views: postData.video_view_count,
      },
      owner: {
        id: postData.owner?.id,
        username: postData.owner?.username,
        fullName: postData.owner?.full_name,
        isVerified: postData.owner?.is_verified,
        profilePicUrl: postData.owner?.profile_pic_url,
        followers: postData.owner?.edge_followed_by?.count,
      },
      takenAt: new Date(postData.taken_at_timestamp * 1000).toISOString(),
      productType: postData.product_type,
      videoDuration: postData.video_duration,
    };

    return NextResponse.json({
      success: true,
      data: {
        transformed: transformedPost,
        raw: rawData,
      },
      cached: response.cached,
      shortcode,
    });

  } catch (error) {
    console.error('Individual post API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}