# Xpanse UI

This is the frontend for the Xpanse project which allows cloud service providers to register managed services to the
service catalog and also for end users to deploy services from the service catalog and manage them.

## Development Setup

Project is built using `ReactJS` library. As we use `TypeScript` here, we must ensure all objects have type explicity
defined.
GUI components are built using `antd` library.

### Starting local development server

In the project directory, you can run the below command to start the local development server. This also additionally
needs `nodejs` to be installed on the development machine.

```shell
$ npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Generate Rest Client for Xpanse API

We use the openapi generator to generate data models and rest client from the openapi json file.
The following steps must be followed to generate new client and datamodels whenever there is a new version if the
swagger json.

1. Copy the openapi file to [OpenApi JSON File](src/xpanse-api/api.json)
2. Run the code generator as below
    ```shell
        cd src/xpanse-api
        npx openapi-typescript-codegen --input api.json --output ./generated --exportSchemas false
    ```
    This step will generate all required models and client
3. Add license headers.
4. Format newly generated files.

## Build for production

```shell
$ npm run build
```

Builds the app for production to the `build` folder. Contents can be copied to any webserver to host the frontend files.
