import { ThemeProvider } from '@/components/providers/theme-providers';
import '@roro-ai/ui/global.css';
import { Poppins } from "next/font/google";
import { Toaster } from 'sonner';

const roboto = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin']
})

export const metadata = {
  title: 'Roro AI',
  description: 'AI communication practice platform for everyone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}
      </head>
      <body className={`${roboto.className}`}>
        <Toaster />
        <ThemeProvider
          attribute={"class"}
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
              {children}
        </ThemeProvider>
      </body>
    </html>
  );
}