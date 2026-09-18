app.delete("/api/tests/:id", authMiddleware, async (req, res) => {  const { id } = req.params;
