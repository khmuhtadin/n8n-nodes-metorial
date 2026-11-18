# n8n-nodes-metorial

Independent community node for [Metorial](https://metorial.com/), not an official Metorial product. Use it in workflows or as an AI Agent tool to manage MCP sessions and connected providers.

## Install and authenticate
Install `n8n-nodes-metorial` via n8n Community Nodes. Create a secret API key in Metorial's Developer > API Keys and add it to an n8n Metorial API credential. Keys are environment-scoped. Session responses may contain a client secret: handle node output as sensitive data.

## Operations
- Create, list, get, update and delete sessions: https://metorial.com/api/sessions
- List, get, add, update and remove session providers: https://metorial.com/api/session-providers
- List providers, deployments and integrations: https://metorial.com/api/providers, https://metorial.com/api/provider-deployments, https://metorial.com/api/integrations

List operations return the complete API response including pagination information. Supply JSON for advanced provider configurations and filters as documented by Metorial; creating a useful session requires an appropriate deployed and authenticated provider. Use expressions or AI Agent tool parameters to supply IDs and JSON. Deletion is destructive.

## About the author
Khairul Muhtadin, n8n Ambassador ([LinkedIn](https://linkedin.com/in/khmuhtadin)).
