import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// 1️⃣ Create a Connected Account (Worker)
export async function createConnectedAccount(email: string): Promise<string> {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    return account.id;
  } catch (error: any) {
    throw new Error(`Error creating Stripe account: ${error.message}`);
  }
}

// 2️⃣ Create a Payment Intent (Buyer Pays)
export async function createPaymentIntent(amount: number, workerAccountId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      application_fee_amount: Math.round(amount * 0.10 * 100), // 10% commission
      transfer_data: {
        destination: workerAccountId, // Worker gets 90% after service completion
      },
    });
    return paymentIntent;
  } catch (error: any) {
    throw new Error(`Error creating payment intent: ${error.message}`);
  }
}

// 3️⃣ Confirm Payment
export async function confirmPayment(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.confirm(paymentIntentId);
  } catch (error: any) {
    throw new Error(`Error confirming payment: ${error.message}`);
  }
}

// 4️⃣ Transfer Funds to Worker After Delay
export async function transferToWorker(amount: number, workerAccountId: string) {
  try {
    return await stripe.transfers.create({
      amount: amount * 100,
      currency: 'usd',
      destination: workerAccountId,
    });
  } catch (error: any) {
    throw new Error(`Error transferring money: ${error.message}`);
  }
}


/**
 * Creates a Stripe Checkout Session
 * @param {number} amount - Amount in cents (e.g., 5000 for $50.00)
 * @returns {Promise<string>} - Checkout URL
 */
export const createCheckoutSession = async (amount: number): Promise<string> => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Service Payment',
              description: 'Payment for service',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
    });

    return session.url as string;
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error.message);
    throw new Error(error.message);
  }
};