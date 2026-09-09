import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Reviews",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
