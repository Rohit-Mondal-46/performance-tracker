
const cloudinary = require('../config/cloudinary');
const pool = require('../config/database');

// POST /api/screenshots/upload
exports.uploadScreenshot = async (req, res) => {
  try {
    const { image, timestamp } = req.body;
    if (!image || !timestamp) {
      return res.status(400).json({ success: false, message: 'Missing image or timestamp' });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const capturedAt = new Date(Number(timestamp));
    if (isNaN(capturedAt.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid timestamp' });
    }
    const today = capturedAt.toISOString().split('T')[0];

    //delete all the previous screenshots if exists
    const alreadyExists = await pool.query(
      `
  SELECT 1
  FROM daily_screenshots
  WHERE employee_id = $1
    AND created_date = CURRENT_DATE
  LIMIT 1
  `,
      [userId]
    );

    if (alreadyExists.rowCount === 0) {
      console.log('[Cleanup] First upload of the day → cleaning old screenshots');

      // Delete DB records older than today
      await pool.query(
        `
    DELETE FROM daily_screenshots
    WHERE employee_id = $1
      AND created_date < CURRENT_DATE
    `,
        [userId]
      );

      // Delete Cloudinary assets
      await cloudinary.api.delete_resources_by_prefix(
        `vista/screenshots/${userId}/`,
        { resource_type: 'image' }
      );
    }


    const folder = `vista/screenshots/${userId}/today`;
    const publicId = `screenshot_${timestamp}`;
    const context = {
      captured_at: capturedAt.toISOString(),
      uploaded_by: 'vista-backend'
    };
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${image}`,
      {
        folder,
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
        tags: [
          'vista',
          'screenshot',
          `user:${userId}`,
          `date:${today}`,
        ],
        context
      }
    );
    await pool.query(
      `
  INSERT INTO daily_screenshots
  (employee_id, organization_id, captured_at, cloudinary_public_id, cloudinary_url, created_date)
  VALUES ($1, $2, $3, $4, $5, $6)
  `,
      [
        userId,
        organizationId,
        capturedAt,
        uploadResult.public_id,
        uploadResult.secure_url,
        today,
      ]
    );

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
  } catch (err) {
    console.error('Screenshot upload error:', err);
    return res.status(500).json({ success: false, message: 'Screenshot upload failed' });
  }

};
// GET /api/screenshots (Employee only)
exports.getTodayScreenshots = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    // Get today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT cloudinary_url, cloudinary_public_id, captured_at FROM daily_screenshots WHERE employee_id = $1 AND created_date = $2 ORDER BY captured_at ASC`,
      [userId, today]
    );
    return res.json({
      success: true,
      screenshots: result.rows
    });
  } catch (err) {
    console.error('Get screenshots error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch screenshots' });
  }
};

// GET /api/screenshots/user/:userId(Organization only)
exports.getUserTodayScreenshots = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId parameter' });
    }
    // Ensure the employee belongs to the same organization
    const orgId = req.user.id;
    const empCheck = await pool.query(
      'SELECT id FROM employees WHERE id = $1 AND organization_id = $2',
      [userId, orgId]
    );
    if (empCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found in your organization' });
    }
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT cloudinary_url, cloudinary_public_id, captured_at FROM daily_screenshots WHERE employee_id = $1 AND created_date = $2 ORDER BY captured_at ASC`,
      [userId, today]
    );
    return res.json({
      success: true,
      screenshots: result.rows
    });
  } catch (err) {
    console.error('Get user screenshots error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user screenshots' });
  }
};