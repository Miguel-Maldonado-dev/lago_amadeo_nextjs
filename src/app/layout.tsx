import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Inter va incluida en el proyecto (subconjunto latin, fuente variable 100–900): con
// next/font/google la compilación descarga la fuente y falla si no hay red (p. ej. en Vercel).
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lago Amadeo',
  description: 'Administración de Lago Amadeo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
