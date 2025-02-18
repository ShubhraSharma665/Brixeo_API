import express from 'express';
import { createCheckout,createAccount,transferFund } from '../../controllers/web/Payment.controller';

const router = express.Router();

router.post('/create-stripe-account', createCheckout);
router.post('/create-checkout-session', createAccount);
router.post('/transfer-fund', transferFund);

export default router;