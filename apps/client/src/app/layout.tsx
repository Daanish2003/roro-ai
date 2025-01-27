import { ThemeProvider } from '@/components/providers/theme-providers';
import './global.css';
import { Poppins } from "next/font/google"

const roboto = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin']
})

export const metadata = {
  title: 'Welcome to client',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className}`}>
        <ThemeProvider
          attribute={"class"}
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
              {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
