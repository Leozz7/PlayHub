/* eslint-disable react-refresh/only-export-components */
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      offset={isMobile || isNative ? 96 : 16}
      duration={2000}
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "flex items-start gap-3 w-full",
            isMobile ? "mt-12" : "",
            "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-800/60",
            "border border-orange-500/30",
            "rounded-xl",
            "shadow-md",
            "pl-4 pr-8 py-3.5",
            "data-[visible=true]:animate-in data-[visible=true]:slide-in-from-top-4 data-[visible=true]:fade-in-0",
          ].join(" "),
          title: [
            "text-[14px] font-semibold text-zinc-900 dark:text-white/95",
            "leading-snug tracking-[-0.01em]",
          ].join(" "),
          description: [
            "text-[12.5px] font-normal text-zinc-600 dark:text-white/55",
            "leading-[1.45] mt-0.5",
          ].join(" "),
          icon: "shrink-0 mt-[1px]",
          actionButton: [
            "h-7 px-3 rounded-lg text-[12px] font-semibold",
            "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white/90",
            "hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors",
            "border border-zinc-200 dark:border-white/[0.12]",
          ].join(" "),
          cancelButton: [
            "h-7 px-3 rounded-lg text-[12px] font-medium",
            "bg-transparent text-zinc-500 dark:text-white/40",
            "hover:text-zinc-800 dark:hover:text-white/60 transition-colors",
          ].join(" "),
          closeButton: [
            "absolute !left-auto !right-3 !top-3",
            "h-4 w-4",
            "text-zinc-400 hover:text-zinc-700 dark:text-white/40 dark:hover:text-white/80",
            "!bg-transparent border-none shadow-none",
            "transition-colors",
          ].join(" "),
          success: [
            "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-orange-500/40",
            "shadow-md",
          ].join(" "),
          error: [
            "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-red-500/30",
            "shadow-md",
          ].join(" "),
          warning: [
            "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-amber-500/30",
            "shadow-md",
          ].join(" "),
          info: [
            "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-blue-500/30",
            "shadow-md",
          ].join(" "),
          loading: "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-orange-500/30 shadow-md",
        },
      }}
      style={
        {
          "--width": "min(380px, calc(100vw - 32px))",
          "paddingTop": isMobile ? "max(44px, env(safe-area-inset-top, 0px))" : "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
