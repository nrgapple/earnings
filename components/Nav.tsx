import { Grid, Link, Text } from '@nextui-org/react'
import NextLink from 'next/link'
import { useSession } from 'next-auth/react'

export const Nav = () => {
  const session = useSession()

  return (
    <Grid.Container>
      <Grid xs={12}>
        <Grid.Container justify="space-between" alignItems="center">
          <Grid xs={3}>
            <Text h2>Tross Capital</Text>
          </Grid>

          <Grid xs={3}>
            <Text>
              <NextLink href="/api/auth/signin">
                <Link block color="secondary">
                  Sign in
                </Link>
              </NextLink>
            </Text>
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
            <Text>Welcome, {session.data?.user.name}</Text>
          </Grid>
        </Grid.Container>
      </Grid>
    </Grid.Container>
  )
}
