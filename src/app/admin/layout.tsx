import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Admin & CMS | IMDAD.BUILDS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 flex flex-col">{children}</div>;
}
