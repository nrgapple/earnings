import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { SessionProvider } from 'next-auth/react'
//import 'gridjs/dist/theme/mermaid.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </NextUIProvider>
  )
}
