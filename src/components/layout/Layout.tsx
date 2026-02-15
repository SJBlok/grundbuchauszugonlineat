import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  compactHeader?: boolean;
}

export function Layout({ children, compactHeader }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header compact={compactHeader} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
