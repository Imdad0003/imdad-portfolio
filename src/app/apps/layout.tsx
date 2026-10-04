import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps | IMDAD.BUILDS Product Lab",
  description:
    "Explore digital products, mobile applications, and software tools built by Imdad.builds, including WishMusic, WishTracking, and EasyXo.",
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 flex flex-col">{children}</div>;
}
