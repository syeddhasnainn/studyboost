"use client";

import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import React, { memo, useCallback, useEffect } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { extractText, getDocumentProxy } from "unpdf";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
// import { useStore } from "@/hooks/use-store";
import { useRef } from "react";
import { useChatContext } from "@/context/ChatContext";

interface PDFViewerProps {
  url: string | null;
  className?: string;
}

function PDFViewer({ url, className }: PDFViewerProps) {
  console.log('pdf url',url);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const zoomPluginInstance = zoomPlugin();
  const { resourceUrl, resourceId } = useChatContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processPdf = async () => {
      if (!url || !resourceId) return;
      // const isExistingChat = await fetch(
      //   `/api/db/check?resourceId=${resourceId}`
      // );
      // const { chat } = (await isExistingChat.json()) as { chat: any };
      // if (chat) return;

      const buffer = await fetch(url).then((res) => res.arrayBuffer());
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf);

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vectors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chunks: text, resourceId }),
        });
      } catch (error) {
        console.error("Failed to upload pdf text:", error);
      }
    };

    processPdf();
  }, [url, resourceId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (zoomPluginInstance.zoomTo) {
        zoomPluginInstance.zoomTo(SpecialZoomLevel.PageWidth);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [zoomPluginInstance]);

  return (
    <div
      ref={containerRef}
      className={`${className} h-[calc(100vh-6rem)] border rounded-lg overflow-hidden `}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url || ""}
          plugins={[
            defaultLayoutPluginInstance,
            toolbarPluginInstance,
            zoomPluginInstance,
          ]}
          defaultScale={SpecialZoomLevel.PageWidth}
          theme={{
            theme: "auto",
          }}
        />
      </Worker>
    </div>
  );
}

const MemoizedPDFViewer = memo(PDFViewer);
export { MemoizedPDFViewer as PDFViewer };
