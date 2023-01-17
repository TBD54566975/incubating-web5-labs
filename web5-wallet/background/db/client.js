import PouchDB from 'pouchdb';
import pouchFind from 'pouchdb-find';

PouchDB.plugin(pouchFind);

export const client = PouchDB;