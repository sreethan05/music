import('../backend/src/server.js').catch((error) => {
  console.error('Failed to start backend server:', error);
  process.exit(1);
});
