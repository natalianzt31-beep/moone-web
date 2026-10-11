import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function MiCuentaLayout({ children }: LayoutProps<"/mi-cuenta">) {
  return children;
}
