import { Card, Container, Input, Link, Row, useInput } from '@nextui-org/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { SearchResult } from '../../interfaces'

export const Searchbar = () => {
  const { query } = useRouter()
  const { value, reset, bindings } = useInput('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    ;(async () => {
      if (value) {
        const response = await fetch(`/api/tickers?search=${value}`)
        const results: SearchResult[] = await response.json()
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    })()
  }, [value])

  useEffect(() => {
    reset()
  }, [query])

  return (
    <Container>
      <Input
        {...bindings}
        width="100%"
        type={'search'}
        placeholder="Search ticker"
        onClearClick={reset}
        underlined
      />
      {searchResults.length > 0 && (
        <Card>
          {searchResults.map((result, i) => (
            <Row key={`search-dropdown-${result.ticker}`}>
              <NextLink
                href={`/metrics/earnings?ticker=${result.ticker}`}
                passHref
              >
                <Link>{result.ticker}</Link>
              </NextLink>
            </Row>
          ))}
        </Card>
      )}
    </Container>
  )
}
