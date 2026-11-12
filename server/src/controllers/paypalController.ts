import { Request, Response, NextFunction } from 'express';
import {
  createPayPalOrder,
  capturePayPalOrder,
  verifyPayPalWebhookSignature,
} from '../services/payments/paypalService.js';
import { verifyActiveApproval } from './checkoutController.js';
import { TransactionRepository, ActivityRepository } from '../models/repository.js';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { approvalToken } = req.body;

    if (!approvalToken) {
      return res.status(400).json({
        success: false,
        error: 'Approval token is required. Please evaluate and approve purchase conditions first.',
      });
    }

    const approval = verifyActiveApproval(approvalToken, userId);
    if (!approval) {
      return res.status(400).json({
        success: false,
        error: 'Approval token has expired or is invalid. Please review and re-authorize purchase.',
      });
    }

    const order = await createPayPalOrder({
      amount: approval.maxAuthorizedAmount,
      currency: approval.currency,
      productName: approval.productName,
      referenceId: approval.analysisId,
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      status: order.status,
      links: order.links,
      isSandbox: true,
      isDemoSimulation: Boolean(order.isDemoSimulation),
      amount: approval.maxAuthorizedAmount,
      currency: approval.currency,
    });
  } catch (err) {
    next(err);
  }
}

export async function captureOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId || 'guest-demo-user-id';
    const { orderId, approvalToken } = req.body;

    if (!orderId || !approvalToken) {
      return res.status(400).json({
        success: false,
        error: 'Both orderId and approvalToken are required to capture PayPal payment.',
      });
    }

    const approval = verifyActiveApproval(approvalToken, userId);
    if (!approval) {
      return res.status(400).json({
        success: false,
        error: 'Approval expired or invalid. Cannot capture payment.',
      });
    }

    // Capture on PayPal server-side and verify amount
    const captureResult = await capturePayPalOrder(
      orderId,
      approval.maxAuthorizedAmount,
      approval.currency
    );

    // Save transaction record idempotently
    const transaction = await TransactionRepository.create({
      userId,
      analysisId: approval.analysisId,
      productName: approval.productName,
      amount: approval.maxAuthorizedAmount,
      currency: approval.currency,
      paypalOrderId: orderId,
      paypalCaptureId: captureResult.captureId || 'CAP-CONFIRMED',
      status: captureResult.status,
      isSandbox: true,
    });

    await ActivityRepository.log(
      userId,
      'PAYMENT_COMPLETED',
      `Completed PayPal Sandbox transaction for "${approval.productName}" (${approval.currency} ${approval.maxAuthorizedAmount}).`,
      { orderId, transactionId: transaction._id }
    );

    return res.json({
      success: true,
      message: 'PayPal Sandbox payment captured and verified successfully.',
      transaction: {
        id: transaction._id.toString(),
        paypalOrderId: orderId,
        paypalCaptureId: captureResult.captureId,
        productName: approval.productName,
        amount: approval.maxAuthorizedAmount,
        currency: approval.currency,
        status: captureResult.status,
        isSandbox: true,
        isDemoSimulation: Boolean(captureResult.isDemoSimulation),
        createdAt: transaction.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const isValid = await verifyPayPalWebhookSignature(req.headers, req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid PayPal webhook signature.' });
    }

    const event = req.body;
    const eventType = event.event_type;
    console.log(`Received verified PayPal Webhook event: ${eventType} [${event.id}]`);

    // Handle idempotently
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const orderId = resource?.supplementary_data?.related_ids?.order_id || event.id;
      // Already recorded via captureOrder; acknowledge event safely
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
