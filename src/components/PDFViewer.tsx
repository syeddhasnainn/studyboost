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
import { useStore } from "@/hooks/use-store";
import { useRef } from "react";

interface PDFViewerProps {
  url: string | null;
  className?: string;
}

function PDFViewer({ url, className }: PDFViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const zoomPluginInstance = zoomPlugin();
  const { pdfUrl, setPdfUrl, resourceId } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const processPdf = async () => {
  //     if (!pdfUrl) return;
  //     const buffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());

  //     const pdf = await getDocumentProxy(new Uint8Array(buffer));
  //     const { text } = await extractText(pdf);

  //     try {
  //       const vectorUploadResponse = await fetch(`/api/vectors`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ chunks:text, resourceId }),
  //       });

  //       const result = await vectorUploadResponse.json();
  //     } catch (error) {
  //       console.error("Failed to upload pdf text:", error);
  //     }
  //   };
  //   processPdf();
  // }, [pdfUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Force a re-render with PageWidth when container size changes
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
      className={`${className} h-[calc(100vh-6rem)] border rounded-lg overflow-hidden`}
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
