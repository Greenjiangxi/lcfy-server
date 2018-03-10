const Router = require('koa-router');
const indexCtrl = require('../controllers/index');
const usersCtrl = require('../controllers/users');
const projectsCtrl = require('../controllers/projects');

const router = Router();

router.get('/', indexCtrl);
router.post('/send_vc', usersCtrl.sendVc);
router.post('/signin', usersCtrl.signin);
router.get('/profile', usersCtrl.getProfile);
router.put('/profile', usersCtrl.updateProfile);

router.get('/projects', projectsCtrl.getProjects);
router.get('/project/:id', projectsCtrl.getProject);

router.get('/transactions', projectsCtrl.getTransactions);
router.post('/trade', projectsCtrl.trade);

module.exports = router;
