const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Welcome'
  });
});

module.exports = router;