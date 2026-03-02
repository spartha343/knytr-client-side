import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./globals-layout.css";
import Providers from "@/lib/Providers";
import { getMetaPixelId } from "@/helpers/config/envConfig";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Knytr | Buy & Sell Online with Confidence",
  description:
    "A modern e-commerce platform offering secure payments, seamless shopping, and a smooth online buying experience for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = getMetaPixelId();
  return (
    <Providers>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}

          {/* TODO: currently we are using limon's pixel id, we will have to handle it later. */}
          {/* Meta Pixel Base Script */}
          {pixelId && (
            <>
              <Script id="meta-pixel" strategy="afterInteractive">
                {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${pixelId}');
                  fbq('track', 'PageView');
                `}
              </Script>
              <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            </>
          )}
        </body>
      </html>
    </Providers>
  );
}
