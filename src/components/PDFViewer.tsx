'use client';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { zoomPlugin } from '@react-pdf-viewer/zoom';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

interface PDFViewerProps {
  url: string;
  className?: string;
}
import React, { memo } from 'react';



function PDFViewer({ url, className }: PDFViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const zoomPluginInstance = zoomPlugin();

  return (
    <div className={`${className} h-[90vh] border rounded-lg overflow-hidden  `}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[
            defaultLayoutPluginInstance,
            toolbarPluginInstance,
            zoomPluginInstance,
          ]}
          defaultScale={1.2}
          theme={{
            theme: 'auto'
          }}
        />
      </Worker>
    </div>
  );
}

const MemoizedPDFViewer = memo(PDFViewer);
export { MemoizedPDFViewer as PDFViewer };
