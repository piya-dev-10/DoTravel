// ---------------------- ADMIN ----------------------
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Handle hardcoded admin user
    if (decoded.userId === 'admin-id') {
      req.adminUser = { 
        _id: 'admin-id', 
        username: 'admin', 
        email: 'admin@dotravel.com', 
        isAdmin: true 
      };
      return next();
    }
    
    // Handle database users
    const user = await User.findById(decoded.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Admin access required' });

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};