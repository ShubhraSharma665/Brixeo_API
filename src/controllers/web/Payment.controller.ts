import { Request, Response } from 'express';
import { createCheckoutSession,createConnectedAccount,transferToWorker } from '../../Services/stripeService';

export const createAccount = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const accountId = await createConnectedAccount(email);
        res.json({ accountId });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
};

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body; // Amount in cents

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const checkoutUrl = await createCheckoutSession(amount);
    res.json({ url: checkoutUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const transferFund = async (req: Request, res: Response) => {
    try {
        const { amount, workerAccountId } = req.body;
        const transfer = await transferToWorker(amount, workerAccountId);
        res.json(transfer);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
};
