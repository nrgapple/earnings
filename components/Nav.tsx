import { Grid, Link, Text } from '@nextui-org/react'
import NextLink from 'next/link'

export const Nav = () => {
  return (
    <Grid.Container>
      <Grid xs={12}>
        <Grid.Container justify="space-between" alignItems="center">
          <Grid xs={3}>
            <Text h2>Tross Capital</Text>
          </Grid>

          <Grid xs={3}>
            <Text>
              <NextLink href="/">
                <Link block color="secondary">
                  Home
                </Link>
              </NextLink>
            </Text>
            <NextLink href="/metrics/earnings">
              <Link block color="secondary">
                Earnings
              </Link>
            </NextLink>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  )
}
