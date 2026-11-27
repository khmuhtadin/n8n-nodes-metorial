# n8n-nodes-metorial

Independent community node for [Metorial](https://metorial.com/), not an official Metorial product. Use it in workflows or as an AI Agent tool to manage MCP sessions and connected providers.

## Installation

Install `n8n-nodes-metorial` in n8n under Settings > Community nodes.

## Credentials and setup

1. Create a secret API key in Metorial under Developer > API Keys. Keys are environment-scoped.
2. In n8n, create a **Metorial API** credential and enter the key in **Secret API Key**. Select this credential in the Metorial node.
3. The credential test requests the sessions list. The node sends the key as a bearer token to `https://api.metorial.com`. The base URL is fixed and cannot be configured in the credential.

Session responses may contain a client secret. Treat node output as sensitive data. Creating a useful session requires an appropriate deployed and authenticated provider.

## Resources and operations

### Session

Manage MCP sessions.

- **Create**: Create a session with provider configurations.
- **Delete**: Delete a session by **Session ID**.
- **Get**: Get a session by **Session ID**.
- **Get Many**: List sessions.
- **Update**: Update a session's name, description or metadata.

### Session Provider

Manage providers attached to sessions.

- **Add**: Add a provider to a session using **Session ID** and **Provider JSON**.
- **Delete**: Delete a session provider by **Session Provider ID**.
- **Get**: Get a session provider by **Session Provider ID**.
- **Get Many**: List session providers, optionally using **Session ID Filter**.
- **Update**: Update a session provider's **Tool Filters JSON**.

### Catalog

Find providers, deployments and integrations available in the Metorial instance. Each operation accepts an optional **Search** value.

- **List Deployments**: List provider deployments.
- **List Integrations**: List integrations.
- **List Providers**: List providers.

List operations preserve an object response, including any pagination information. If the API returns an array, the node outputs one item per array entry. Delete operations are destructive.

## JSON field formats

Enter valid JSON, not a JavaScript object literal. The node checks the top-level array or object type but does not validate the inner keys or whether the API accepts their values. See the Metorial API links below for supported configurations.

### Providers JSON

For **Session > Create**, use an array of provider configurations:

```json
[
  { "provider_deployment_id": "pde_1" }
]
```

This field is required and defaults to `[]`. A blank value fails JSON parsing; `[]` is valid JSON but does not configure a provider. The array is sent as `providers`.

### Provider JSON

For **Session Provider > Add**, use one provider configuration object:

```json
{ "provider_deployment_id": "pde_1" }
```

This field is required and defaults to `{}`. A blank value fails JSON parsing; `{}` is accepted by the node, but the API may require provider settings. The object is merged into the request body, and the **Session ID** value is sent as `session_id`, overriding any `session_id` in the object.

### Tool Filters JSON

For **Session Provider > Update**, use a filter object:

```json
{ "type": "tool_keys", "keys": [] }
```

This field is required and defaults to the object shown. A blank value fails JSON parsing. The object is sent as `tool_filters`.

### Metadata JSON

For **Session > Create** or **Update**, use an object with custom metadata, for example:

```json
{ "team": "support", "workflow": "ticket-triage" }
```

This field is optional and blank by default. When blank, `metadata` is omitted from the request; `{}` sends an empty object.

## Example: create and get a session

1. Add a Metorial node after a trigger and select your **Metorial API** credential.
2. Set **Resource** to **Session**, **Operation** to **Create**, and **Name** to `test`. Set **Providers JSON** to the array below, replacing `pde_1` with the ID of your deployed and authenticated provider. Leave **Description** and **Metadata JSON** blank.

   ```json
   [
     { "provider_deployment_id": "pde_1" }
   ]
   ```

3. Execute the node. It sends `POST https://api.metorial.com/sessions` with this request body:

   ```json
   {
     "name": "test",
     "providers": [
       { "provider_deployment_id": "pde_1" }
     ]
   }
   ```

   The node outputs the API response as one item. Abridged example (the real response has more fields):

   ```json
   { "id": "ses_1" }
   ```

4. Connect another Metorial node. Set **Resource** to **Session**, **Operation** to **Get**, and **Session ID** to the expression `{{ $json.id }}`. Run it to retrieve the session you just created.

## Compatibility

The package requires Node.js 20 or later. `package.json` does not specify a minimum n8n version.

## Workflow template

[`examples/template-metorial-stale-session-cleanup.json`](examples/template-metorial-stale-session-cleanup.json): **Clean up stale MCP sessions with Metorial and Slack**. Import it in n8n (Workflows > Import from file). Setup steps are in the yellow sticky note.

## Resources and links

- [Metorial API](https://metorial.com/api)
- [Sessions](https://metorial.com/api/sessions) and [session providers](https://metorial.com/api/session-providers)
- [Providers](https://metorial.com/api/providers), [provider deployments](https://metorial.com/api/provider-deployments) and [integrations](https://metorial.com/api/integrations)
- [List sessions example workflow](examples/list-sessions.json)

## License

[MIT](LICENSE).

## About the author

Khairul Muhtadin, n8n Ambassador ([LinkedIn](https://linkedin.com/in/khmuhtadin)).
