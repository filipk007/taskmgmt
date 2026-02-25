// Schema version history for Dexie migrations.
//
// Version 1 (initial):
//   tasks: 'id, clientId, projectId, status, priority, deadline, *tags, orderIndex, createdAt, doneAt'
//   projects: 'id, *clientIds, createdAt'
//   clients: 'id, name, createdAt'
//
// To add a new migration:
// 1. Import db from './db'
// 2. Add db.version(N).stores({...}).upgrade(tx => {...})
// 3. Document the change here
//
// Example:
// db.version(2).stores({
//   tasks: 'id, clientId, projectId, status, priority, deadline, *tags, orderIndex, createdAt, doneAt, isRecurring',
// }).upgrade(tx => {
//   return tx.table('tasks').toCollection().modify(task => {
//     task.isRecurring = false;
//   });
// });
