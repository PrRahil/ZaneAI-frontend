"use client";

export const LayoutSplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-3 opacity-0 animate-fadeIn">
        <div className="h-12 w-12 flex items-center justify-center">
          <img
            src="/zane-logo.png"
            alt="Zane AI Logo"
            className="h-12 w-12 object-contain"
          />
        </div>

        <span className="font-bold text-2xl text-foreground tracking-wide">
          Zane
        </span>
      </div>
    </div>
  );
};
