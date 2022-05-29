import React, { ReactNode } from 'react'
import Head from 'next/head'
import { Nav } from '../Nav'

type Props = {
  children?: ReactNode
  title?: string
  onSearchChange?: () => unknown
}

const Layout = ({ children, title = 'Earning Reports' }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Nav />
    {children}
  </div>
)

export default Layout
