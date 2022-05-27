import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { SwaggerUIProps } from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(import('swagger-ui-react'), {
  ssr: false,
}) as ComponentType<SwaggerUIProps>

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  //@ts-ignore
  return <SwaggerUI spec={spec} />
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Next Swagger API Example',
        version: '0.0.1',
      },
    },
  })

  return {
    props: {
      spec,
    },
  }
}

export default ApiDoc
