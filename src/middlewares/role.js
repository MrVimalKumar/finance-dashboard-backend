const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Access denied"
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };
};

module.exports = authorize;