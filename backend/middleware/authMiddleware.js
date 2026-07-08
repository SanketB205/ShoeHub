exports.requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID is missing' });
  }

  req.user = { id: userId };
  next();
};
