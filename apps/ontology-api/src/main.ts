/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

function setupOpenApi(
  app: INestApplication,
  documentBuilder: DocumentBuilder,
  authorizationUrl?: string,
  openIdConnectUrl?: string,
  clientId?: string,
  scopes?: string[],
  uiPath = '',
) {
  if (!scopes) {
    scopes = [];
  }
  const oauthSchema: SecuritySchemeObject = {
    type: 'oauth2',
    flows: {
      implicit: {
        authorizationUrl: authorizationUrl,
        scopes: scopes,
      },
    },
  };
  if (authorizationUrl) {
    documentBuilder = documentBuilder.addOAuth2(oauthSchema);
  }
  const openIDSchema: SecuritySchemeObject = {
    type: 'openIdConnect',
    openIdConnectUrl: openIdConnectUrl,
  };
  if (openIdConnectUrl) {
    documentBuilder = documentBuilder.addSecurity('OpenIdc', openIDSchema);
  }

  const options = documentBuilder.build();
  const document = SwaggerModule.createDocument(app, options);

  const components = document.components as any;
  const unsortedSchemas = components.schemas;
  if (unsortedSchemas) {
    const schemaNames = Object.keys(unsortedSchemas).sort();

    const schemas: { [name: string]: any } = {};
    for (const schemaName of schemaNames) {
      schemas[schemaName] = unsortedSchemas?.[schemaName];
    }
    components.schemas = schemas;
  }

  const uiOptions = {
    oauth: {
      clientId: clientId,
    },
    //tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  };
  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'BioSimulations API Documentation',

    swaggerOptions: uiOptions,
    customCss: ' .swagger-ui .topbar { display: none }',
  };
  SwaggerModule.setup(uiPath, app, document, customOptions);

  return document;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('server.port');
  const host = configService.get('server.host');
  const limit = configService.get('server.limit');

  // TODO intelligently allow origin based on production mode, abstract this
  const allowOrigin: CustomOrigin = (
    requestOrigin: string,
    callback: (err: Error | null, allow?: boolean | undefined) => void,
  ) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }
    const allowedOrigins = [
      'http://127.0.0.1:4200',
      'http://127.0.0.1:4201',
      'http://127.0.0.1:4202',
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:4202',
      'https://biosimulators.org',
      'https://www.biosimulators.org',
      'https://biosimulators.dev',
      'https://www.biosimulators.dev',
      'https://run.biosimulations.dev',
      'https://run.biosimulations.org',
    ];

    const allow = allowedOrigins.includes(requestOrigin);
    const error = null;
    callback(error, allow);
  };
  app.enableCors({ origin: allowOrigin });
  const doc = new DocumentBuilder()
    .setTitle('BioSimulations/BioSimulators ontology API')
    .setDescription(
      'API for the ontologies and their terms used by BioSimulations and BioSimulators.',
    )
    .setVersion('0.1')
    .setLicense(
      'MIT License',
      'https://github.com/biosimulations/Biosimulations/blob/dev/LICENSE',
    )
    .setTermsOfService('https://biosimulations.org/help/terms')
    .setExternalDoc(
      'API specifications (Open API JSON)',
      'https://ontology.api.biosimulations.org/openapi.json',
    )
    .setContact(
      'BioSimulations Team',
      'https://biosimulations.org/help/about',
      'info@biosimulations.org',
    );

  const tags = [
    {
      name: 'Ontologies',
      description:
        'Operations for getting a list of the supported ontologies, getting entire ontologies, and getting individual terms.',
    },
  ];
  for (const tag of tags) {
    doc.addTag(tag.name, tag.description);
  }

  const document = setupOpenApi(
    app,
    doc,
    'https://auth.biosimulations.org/authorize?audience=api.biosimulations.org',
    'https://auth.biosimulations.org/.well-known/openid-configuration',
    'mfZoukkw1NCTdltQ0KhWMn9KXVNq7gfT',
  );

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/openapi.json', (req, res) => res.json(document));

  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
