import { Command } from 'commander';
import { RemoteDwnClient } from '../../lib/remote-dwn-client.js';
import { DidLoader } from '../../did/did-loader.js';
import { RecordsQuery } from '@tbd54566975/dwn-sdk-js';
import { Contact } from '../../models/contact.js';

export const cmd = new Command('contacts');

cmd.description('prints out your didbook');

cmd.action(async () => {
  const query = await RecordsQuery.create({
    filter: {
      schema: 'contact'
    },
    authorizationSignatureInput: DidLoader.getSignatureMaterial(),
  });

  const result = await RemoteDwnClient.send(query.toJSON(), DidLoader.getDid());

  if (result.status.code !== 200) {
    throw new Error('Failed to get contacts');
  }

  const contacts = [];
  
  for (let entry of result.entries) {
    const contact = Contact.fromDWebMessage(entry);
    contacts.push(contact.data);
  }

  console.table(contacts, ['handle', 'did']);
});