# Proxy as a Service (PraaS)
PraaS is a web application proxy server that lets *developers* to use non-traditional storage in their applications. Google spreadsheet, AirTable, SmartSheet are some examples that fit the category of non-traditional storage in contrast to filesystems and traditional databases.

# Problem Statement
Web Services that provide a REST API for custom flow integration on the customer end present an interesting space for a class of applications that developers can target for modern web applications (a.k.a WebApps). Such apps can be pushed to servers managed by yet another service provider (such as zeit and netlify and AWS S3).

The most common means to consume the REST API is via an access token submitted by the client application (WebApp) as a bearer token. This approach works without regard to security if the endpoint for integration is within a protected perimeter of the customer's integration.  If the endpoint is public then embedding such an access token in the client poses a security risk.

Embedding this access token in the client code is a bad idea and all REST API service providers advise developers to avoid. This is the problem that PraaS aims to resolve. 

The common strategy to mitigate that risk is to setup a proxy server to which the client makes the REST call, which then forwards the request to the actual REST API endpoint after inserting the access token (which was obtained by the developer and stored on the proxy server, often in an unsecure way).

For developers this introduces unnecessary friction in having to deploy a server and deal with the operational aspects of that server. It violates the DRY principle and negates the whole concept of serverless WebApps where the idea is that you build a rich single page app and delegate the responsibility of serving that app to a third party service provider.

# Solution
PraaS allows developers to manage API endpoint proxies so that they can focus on creating serverless webapps with stalling on a DevOps task everytime a webapp needs to store data remotely. Deploy the code once and start creating your API proxy using a simple web interface. We created this project for our own internal experiments. Once completed and stable, we intend to deploy it and make it available as a service for public consumption.
