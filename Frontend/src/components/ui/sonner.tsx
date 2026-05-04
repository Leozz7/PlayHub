/* eslint-disable react-refresh/only-export-components */
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { useState, useEffect } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      offset={isMobile ? 96 : 20}
      duration={3000}
      closeButton
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            // Layout base
            "flex items-center gap-3 w-full",
            isMobile ? "mt-12" : "",
            // Fundo glassmorphism adaptado ao PlayHub
            "bg-white/95 dark:bg-background/95",
            "backdrop-blur-xl",
            "supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80",
            // Borda sutil
            "border border-gray-200/80 dark:border-gray-700/60",
            // Forma premium
            "rounded-2xl",
            // Sombra acolchoada
            "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.4),0_2px_8px_-2px_rgba(0,0,0,0.25)]",
            // Espaçamento
            "pl-4 pr-10 py-3.5",
            // Animação de entrada
            "data-[visible=true]:animate-in",
            "data-[visible=true]:slide-in-from-bottom-3",
            "data-[visible=true]:fade-in-0",
            "data-[visible=true]:duration-300",
          ].join(" "),

          title: [
            "!text-[13.5px] !font-bold !text-gray-900 dark:!text-white",
            "leading-snug tracking-[-0.01em]",
          ].join(" "),

          description: [
            "!text-[12px] !font-normal !text-gray-600 dark:!text-gray-400",
            "leading-[1.5] mt-0.5",
          ].join(" "),

          icon: "shrink-0",

          actionButton: [
            "h-7 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider",
            "bg-[#8CE600] text-gray-950",
            "hover:bg-[#7bc900] transition-colors",
            "shadow-sm shadow-[#8CE600]/20",
          ].join(" "),

          cancelButton: [
            "h-7 px-3 rounded-lg text-[11px] font-medium",
            "bg-transparent text-gray-400 dark:text-gray-500",
            "hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
          ].join(" "),

          closeButton: [
            "absolute !left-auto !right-2.5 !top-1/2 !-translate-y-1/2",
            "h-5 w-5",
            "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
            "!bg-transparent border-none shadow-none",
            "transition-colors",
          ].join(" "),

          // Variantes por tipo — borda colorida esquerda via box-shadow
          success: [
            "border-l-[3px] border-l-[#8CE600]",
            "shadow-[0_8px_32px_-4px_rgba(140,230,0,0.08),0_2px_8px_-2px_rgba(0,0,0,0.06)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(140,230,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
          ].join(" "),

          error: [
            "border-l-[3px] border-l-red-500",
            "shadow-[0_8px_32px_-4px_rgba(239,68,68,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(239,68,68,0.14),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
          ].join(" "),

          warning: [
            "border-l-[3px] border-l-amber-500",
            "shadow-[0_8px_32px_-4px_rgba(245,158,11,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(245,158,11,0.14),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
          ].join(" "),

          info: [
            "border-l-[3px] border-l-blue-500",
            "shadow-[0_8px_32px_-4px_rgba(59,130,246,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)]",
            "dark:shadow-[0_8px_32px_-4px_rgba(59,130,246,0.14),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
          ].join(" "),

          loading: [
            "border-l-[3px] border-l-gray-400 dark:border-l-gray-500",
          ].join(" "),
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



