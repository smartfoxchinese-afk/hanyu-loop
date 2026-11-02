import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HANYU LOOP – Learn Chinese. Live the Language.",
  description:
    "Thế giới học tiếng Trung cho người Việt: khám phá, làm nhiệm vụ, ghi nhớ chữ Hán và lớn lên cùng cáo nhỏ Xiao Hu.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f3ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
