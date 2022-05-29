import { Grid, Link, Text } from '@nextui-org/react'
import NextLink from 'next/link'
import { Searchbar } from '../Searchbar'

export const Nav = () => {
  return (
    <Grid.Container
      justify="space-between"
      alignItems="center"
      css={{
        p: '$6',
      }}
    >
      <Grid xs={5}>
        <Text css={{ pr: '$5' }} h4>
          Tross Capital
        </Text>
        <NextLink href="/">
          <Link block color="secondary">
            Home
          </Link>
        </NextLink>
        <NextLink href="/metrics/earnings">
          <Link block color="secondary">
            Earnings
          </Link>
        </NextLink>
      </Grid>
      <Grid xs={4}>
        <Searchbar />
      </Grid>
    </Grid.Container>
  )
}
