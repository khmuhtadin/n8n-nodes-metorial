import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export class MetorialApi implements ICredentialType {
 name = 'metorialApi'; displayName = 'Metorial API';
 icon = { light: 'file:../nodes/Metorial/metorial.svg', dark: 'file:../nodes/Metorial/metorial.dark.svg' } as const;
 documentationUrl = 'https://metorial.com/api';
 properties: INodeProperties[] = [{ displayName: 'Secret API Key', name: 'apiKey', type: 'string', typeOptions: { password: true }, default: '', required: true }];
 authenticate: IAuthenticateGeneric = { type: 'generic', properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } } };
 // GET /sessions https://metorial.com/api/sessions
 test: ICredentialTestRequest = { request: { baseURL: 'https://api.metorial.com', url: '/sessions', method: 'GET', json: true } };
}
