"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function TestInstagramFlexible() {
  const [embedHtml, setEmbedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Process Instagram embeds when embedHtml changes
  useEffect(() => {
    if (embedHtml && window.instgrm && window.instgrm.Embeds) {
      setTimeout(() => {
        window.instgrm.Embeds.process();
      }, 100);
    }
  }, [embedHtml]);

  const testEmbeds = [
    {
      title: "Test 1: Small Container (300px)",
      containerWidth: "300px",
    },
    {
      title: "Test 2: Medium Container (500px)",
      containerWidth: "500px",
    },
    {
      title: "Test 3: Large Container (800px)",
      containerWidth: "800px",
    },
    {
      title: "Test 4: Full Width Container",
      containerWidth: "100%",
    },
  ];

  const sampleEmbedHtml = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/C1234567890/" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"><a href="https://www.instagram.com/p/C1234567890/" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"><div style="display: flex; flex-direction: row; align-items: center;"><div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div><div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"><div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div><div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div><div style="display:block; height:50px; margin:0 auto 12px; width:50px;"></div><div style="padding-top: 8px;"><div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div></div></blockquote>`;

  const handleLoadSample = () => {
    setIsLoading(true);
    setTimeout(() => {
      setEmbedHtml(sampleEmbedHtml);
      setIsLoading(false);
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Instagram Flexible Width Test</h1>
        <p className="text-gray-600">
          Testing Instagram embeds with flexible width to ensure they expand
          properly within their containers.
        </p>
        <button
          onClick={handleLoadSample}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Load Sample Instagram Embed"}
        </button>
      </div>

      {embedHtml && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">
            Instagram Embed in Different Container Sizes
          </h2>

          {testEmbeds.map((test, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-lg font-medium">{test.title}</h3>
              <div
                className="border-2 border-dashed border-gray-300 p-4 rounded-lg"
                style={{ width: test.containerWidth }}
              >
                <div
                  className="instagram-embed"
                  dangerouslySetInnerHTML={{ __html: embedHtml }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Container width: {test.containerWidth}
              </p>
            </div>
          ))}

          <div className="space-y-4 mt-8">
            <h2 className="text-2xl font-semibold">Grid Layout Test</h2>
            <p className="text-gray-600">
              Testing Instagram embeds in a grid layout similar to the boards
              page
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(num => (
                <div
                  key={num}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium mb-2">Grid Item {num}</h4>
                  <div
                    className="instagram-embed"
                    dangerouslySetInnerHTML={{ __html: embedHtml }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
