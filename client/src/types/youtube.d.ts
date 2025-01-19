interface Window {
  onYouTubeIframeAPIReady: () => void;
  YT: {
    Player: new (
      elementId: string,
      config: {
        events: {
          onReady: (event: { target: YouTubePlayer }) => void;
        };
      }
    ) => void;
  };
} 