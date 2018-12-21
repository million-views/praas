# Proxy as a Service (PraaS)
PraaS provides a means to manage REST API access tokens and forward requests to preconfigured non-traditional storage (**NTS**) end points. AirTable and SmartSheet are a couple of examples that fit the NTS category in contrast to filesystems and traditional databases.

# Use cases
1. As a tech savvy digital marketer I want to experiment with several landing pages for a time bound campaign to capture interest list. I already have an AirTable account. Rather than look for yet another service or fire up a server instance and a database, I decide to capture this information and store it in an AirTable base.

2. As a techie blogger I want to be able to capture reactions (thumbs-up, thumbs-down) from my readers. I have a Smartsheet account already. Rather than look for yet another service or fire up a server instance and a database I decide to collect these reactions in a smartsheet.

3. As an open source developer following new fangled UI frameworks sprouting everyday, I spend time writing code and publish them to github.io (instead of hosting the sample code on my own server). This works until one day I get to the part where I need to store some data persistently. I have a free gmail account that gives me access to google spreadsheet. I start thinking if it is possible to use that as a storage medium for my sample app.

4. As a marketer I don't want to expose my NTS access token to a third party developer. I want to instead provide a unique URI that acts as a **conduit** to my NTS and give me additional controls.

## Why don't we simply use the "forms" feature provided by AirTable, Smartsheet and Spreadsheets?
We are looking for an excuse to build "something" as a service, so we don't really have any compelling reasons to not choose the  in-built features offered by these services. If that works for you, use it.

However here a few reasons that may resonate with you:
- The look Look & Feel may not be what you want
- You don't like the ugly URLs
- You need to add additional validation/processing on the client end not offered natively

## What about security and bots?
Unfortunately we don't have a good answer. The fact is any *storage endpoint* that is *public* will be subjected to bot attacks and abused. That is the price to pay for being open to public feedback.

You can still use this service within an enterprise where there is a firewall at the perimeter and therefore it can be made as secure as the rest of your infrastructure is.

We have features that can mitigate such attacks but be advised that we have no intention of solving this problem completely because it cannot be solved (easily). Please remember that this service is for those use cases that do not require authentication.

> NOTE: the service management will of course have an authentication. Aside, if you can think of a use case where
> this service can be used but requires authenticated access to the conduits, let us know. 

# WebApps and the serverless paradigm
Simple WebApps (that consume data or those that use only local storage) can be pushed to Zeit, Netlify, AWS S3, GitHub.IO, ... allowing for an *almost* serverless architecture. The serverless here implies that the organization building the WebApp is not the one responsible for baby sitting the servers. The code has to be run and served by someone somewhere and there is a price to pay for that eventually!

The moment a WebApp has to store data persistently and survive a cache refresh, things get a bit more complicated. This is when the app starts needing a *backend*, introducing friction in having to deploy a server and deal with the operational aspects of that server. For small *widgets* and *gadgets* this process violates the DRY principle and negates the whole concept of serverless WebApps where the idea is that you build a rich single page app and delegate the responsibility of serving that app to a third party service provider.

# Solution
PraaS allows users to create conduits to their NTS without having to rely on DevOps in order to deploy simple WebApps that require a place to store data persistently. 

We created this project for our own internal experiments. Once completed and stable, we intend to deploy it and make it available as a service for public consumption. Until then you will have to deploy it on your server instance once. Reach out if you need help.

# Status
- Inception stage, work in progress

# Features
- Open source, MIT License
- Simple web interface to manage conduits
- Request Access Control Map (configurable CORS?)
- Request Throttling
- IP Address Whitelist
- Hidden Form Field

# Contribution
We are still in the design stage. When the project gets to a point where it is actually functional, we'll be happy to receive your pull request. Until then stay tuned!
