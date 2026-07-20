import { AmbientBackdrop } from "@/components/ui/AmbientBackdrop";
import { MobileLogoutButton } from "@/components/ui/MobileLogoutButton";
import { NightSky } from "@/components/ui/NightSky";
import { NotificationAsk } from "@/components/ui/NotificationAsk";
import { PageTransition } from "@/components/ui/PageTransition";
import { TabBar } from "@/components/ui/TabBar";
import { ThemeParticles } from "@/components/ui/ThemeParticles";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh md:pl-[280px]">
      <AmbientBackdrop />
      <NightSky />
      <ThemeParticles />
      <TabBar />
      <MobileLogoutButton />
      <div className="relative z-10 mx-auto max-w-md pb-28 md:max-w-2xl md:px-6 md:pb-16 md:pt-2 lg:max-w-3xl">
        <NotificationAsk />
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
