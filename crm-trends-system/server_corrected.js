// Serve React dashboard build files
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard/build')));

// Catch all handler for React app - must be after API routes
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/build/index.html'));
});

module.exports = app;
