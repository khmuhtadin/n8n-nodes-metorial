import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
const fields = (displayName: string, name: string, show: string[], description: string, required = false): INodeProperties => ({ displayName, name, type: 'string', default: '', required, description, displayOptions: { show: { operation: show } } });
export class Metorial implements INodeType {
 description: INodeTypeDescription = {
  displayName: 'Metorial', name: 'metorial', icon: { light: 'file:metorial.svg', dark: 'file:metorial.dark.svg' }, group: ['transform'], version: 1,
  description: 'Manage MCP sessions, providers and integrations in Metorial', subtitle: '={{$parameter.resource + ": " + $parameter.operation}}', defaults: { name: 'Metorial' },
  inputs: [NodeConnectionTypes.Main], outputs: [NodeConnectionTypes.Main], usableAsTool: true, credentials: [{ name: 'metorialApi', required: true }],
  properties: [
   { displayName: 'Resource', name: 'resource', type: 'options', noDataExpression: true, default: 'session', options: [
    { name: 'Catalog', value: 'catalog', description: 'Providers, deployments and integrations available in your Metorial instance' },
    { name: 'Session', value: 'session' },
    { name: 'Session Provider', value: 'sessionProvider' },
   ] },
   { displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true, default: 'listSessions', displayOptions: { show: { resource: ['session'] } }, options: [
    { name: 'Create', value: 'createSession', action: 'Create a session' },
    { name: 'Delete', value: 'deleteSession', action: 'Delete a session' },
    { name: 'Get', value: 'getSession', action: 'Get a session' },
    { name: 'Get Many', value: 'listSessions', action: 'List sessions' },
    { name: 'Update', value: 'updateSession', action: 'Update a session' },
   ] },
   { displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true, default: 'listSessionProviders', displayOptions: { show: { resource: ['sessionProvider'] } }, options: [
    { name: 'Add', value: 'createSessionProvider', action: 'Add a provider to a session' },
    { name: 'Delete', value: 'deleteSessionProvider', action: 'Delete a session provider' },
    { name: 'Get', value: 'getSessionProvider', action: 'Get a session provider' },
    { name: 'Get Many', value: 'listSessionProviders', action: 'List session providers' },
    { name: 'Update', value: 'updateSessionProvider', action: 'Update a session provider' },
   ] },
   { displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true, default: 'listProviders', displayOptions: { show: { resource: ['catalog'] } }, options: [
    { name: 'List Deployments', value: 'listDeployments', action: 'List provider deployments' },
    { name: 'List Integrations', value: 'listIntegrations', action: 'List integrations' },
    { name: 'List Providers', value: 'listProviders', action: 'List providers' },
   ] },
   fields('Session ID', 'sessionId', ['getSession','updateSession','deleteSession','createSessionProvider'], 'The session ID returned by Metorial', true),
   fields('Session Provider ID', 'sessionProviderId', ['getSessionProvider','updateSessionProvider','deleteSessionProvider'], 'The ID of a provider attached to a session', true),
   fields('Name', 'name', ['createSession','updateSession'], 'A descriptive name for this session'),
   fields('Description', 'description', ['createSession','updateSession'], 'A description for this session'),
   { ...fields('Providers JSON', 'providers', ['createSession'], 'JSON array of provider configurations, for example [{"provider_deployment_id":"pde_..."}]. See Metorial session API.', true), default: '[]', typeOptions: { rows: 4 } },
   { ...fields('Provider JSON', 'provider', ['createSessionProvider'], 'JSON object of provider settings, for example {"provider_deployment_id":"pde_..."}', true), default: '{}', typeOptions: { rows: 4 } },
   { ...fields('Tool Filters JSON', 'toolFilters', ['updateSessionProvider'], 'JSON filter, for example {"type":"tool_keys","keys":[]}', true), default: '{"type":"tool_keys","keys":[]}', typeOptions: { rows: 3 } },
   { ...fields('Metadata JSON', 'metadata', ['createSession','updateSession'], 'Optional JSON object with custom metadata'), typeOptions: { rows: 3 } },
   fields('Session ID Filter', 'sessionFilter', ['listSessionProviders'], 'Only return providers connected to this session'),
   fields('Search', 'search', ['listProviders','listDeployments','listIntegrations'], 'Filter results by search text'),
  ],
 };
 async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const out: INodeExecutionData[] = [];
  for (let i=0; i<this.getInputData().length; i++) { try {
   const op = this.getNodeParameter('operation', i) as string;
   const p = (key: string) => String(this.getNodeParameter(key, i, ''));
   const parse = (key: string, array = false): IDataObject | IDataObject[] => { let value: unknown; try { value = JSON.parse(p(key)); } catch { throw new NodeOperationError(this.getNode(), `${key} must be valid JSON`, { itemIndex: i }); } if (array ? !Array.isArray(value) : !value || typeof value !== 'object' || Array.isArray(value)) throw new NodeOperationError(this.getNode(), `${key} must be a JSON ${array ? 'array' : 'object'}`, { itemIndex: i }); return value as IDataObject | IDataObject[]; };
   // Sessions: https://metorial.com/api/sessions
   // Session providers: https://metorial.com/api/session-providers
   // Providers: https://metorial.com/api/providers
   // Deployments: https://metorial.com/api/provider-deployments
   // Integrations: https://metorial.com/api/integrations
   const paths: Record<string,string> = { listSessions:'/sessions',createSession:'/sessions',getSession:'/sessions',updateSession:'/sessions',deleteSession:'/sessions',listSessionProviders:'/session-providers',createSessionProvider:'/session-providers',getSessionProvider:'/session-providers',updateSessionProvider:'/session-providers',deleteSessionProvider:'/session-providers',listProviders:'/providers',listDeployments:'/provider-deployments',listIntegrations:'/integrations' };
   if (!paths[op]) throw new NodeOperationError(this.getNode(), 'Unknown operation', {itemIndex:i});
   let url = `https://api.metorial.com${paths[op]}`;
   if (['getSession','updateSession','deleteSession'].includes(op)) url += `/${encodeURIComponent(p('sessionId'))}`;
   if (['getSessionProvider','updateSessionProvider','deleteSessionProvider'].includes(op)) url += `/${encodeURIComponent(p('sessionProviderId'))}`;
   const method = op.startsWith('create') ? 'POST' : op.startsWith('update') ? 'PATCH' : op.startsWith('delete') ? 'DELETE' : 'GET';
   const body: IDataObject = {}; const qs: IDataObject = {};
   if (['createSession','updateSession'].includes(op)) { if (p('name')) body.name=p('name'); if (p('description')) body.description=p('description'); if (p('metadata')) body.metadata=parse('metadata'); if (op==='createSession') body.providers=parse('providers',true); }
   if (op==='createSessionProvider') { Object.assign(body,parse('provider')); body.session_id=p('sessionId'); }
   if (op==='updateSessionProvider') body.tool_filters=parse('toolFilters');
   if (op==='listSessionProviders' && p('sessionFilter')) qs.session_id=p('sessionFilter');
   if (['listProviders','listDeployments','listIntegrations'].includes(op) && p('search')) qs.search=p('search');
   const request: {method:'GET'|'POST'|'PATCH'|'DELETE';url:string;json:boolean;body?:IDataObject;qs?:IDataObject} = {method,url,json:true};
   if (method==='POST' || method==='PATCH') request.body=body; if (Object.keys(qs).length) request.qs=qs;
   const result = await this.helpers.httpRequestWithAuthentication.call(this,'metorialApi',request) as IDataObject | IDataObject[] | null;
   // Preserve pagination envelope; deletion may return no body.
   if (Array.isArray(result)) for (const row of result) out.push({json:row,pairedItem:{item:i}}); else out.push({json:result && typeof result==='object' ? result : { success: true },pairedItem:{item:i}});
  } catch (error) { if (!this.continueOnFail()) throw error instanceof NodeOperationError ? error : new NodeOperationError(this.getNode(), error as Error, {itemIndex:i}); out.push({json:{error:(error as Error).message},pairedItem:{item:i}}); } }
  return [out];
 }
}
