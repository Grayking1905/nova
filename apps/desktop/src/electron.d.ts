export {};

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      getScreenSources: () => Promise<{ id: string; name: string; thumbnail: string }[]>;
      selectScreenSource: (id: string) => Promise<void>;
    };
  }
}
