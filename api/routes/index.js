import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        rendererJS: '<script defer type="module" src="/scripts/renderer.js"></script>',
        styles: 'style',
        documentTitle: 'RecuEngine'
    });
});

export default router;