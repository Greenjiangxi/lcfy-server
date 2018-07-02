const Router = require('koa-router');
const indexCtrl = require('../controllers/index');
const usersCtrl = require('../controllers/users');
const projectsCtrl = require('../controllers/projects');

const router = Router();

router.get('/', indexCtrl);
router.post('/send_vc', usersCtrl.sendVc);
router.post('/signin_pw', usersCtrl.signinPw);
router.post('/signin_vc', usersCtrl.signinVc);
router.get('/profile', usersCtrl.getProfile);
router.put('/profile', usersCtrl.updateProfile);

router.get('/comodities', projectsCtrl.getComodities);
router.get('/comodities/:id', projectsCtrl.getComodity);
router.get('/token/:id', projectsCtrl.getToken);
router.get('/transactions/:id', projectsCtrl.getTransactions);
router.get('/trend/:id', projectsCtrl.getTrend);

router.post('/payments', projectsCtrl.createPayment);

router.get('/properties', projectsCtrl.getProperties);
//router.get('/properties/:id', projectsCtrl.getProperty);

router.get('/logs', projectsCtrl.getLogs);
router.post('/trade', projectsCtrl.trade);

router.get('/tokens', projectsCtrl.getTokens);


module.exports = router;
