import { Resend } from 'resend';
import { env } from '../config/env';
import { IOrder } from '../models/Order';

const resend = new Resend(env.RESEND_API_KEY);

function getBaseHtml(title: string, message: string, orderHtml: string) {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #3E1F0F; text-align: center; font-size: 24px;">${title}</h2>
      <p style="color: #333333; font-size: 16px; line-height: 1.5;">${message}</p>
      
      <div style="margin: 24px 0;">
        ${orderHtml}
      </div>
      
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />
      <p style="color: #999999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Fashion Store. All rights reserved.</p>
    </div>
  `;
}

function getOrderDetailsHtml(order: IOrder) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title} (x${item.quantity})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  return `
    <h3 style="color: #333;">Order #${order.orderNumber}</h3>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr>
          <th style="padding: 8px; border-bottom: 2px solid #ddd;">Item</th>
          <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <th style="padding: 8px; text-align: right;">Total:</th>
          <th style="padding: 8px; text-align: right;">₹${order.total}</th>
        </tr>
      </tfoot>
    </table>
  `;
}

export async function sendOrderPlacedEmail(email: string, name: string, order: IOrder): Promise<void> {
  const title = 'Order Confirmed!';
  const message = `Hello ${name},<br><br>Thank you for shopping with us! Your order <strong>#${order.orderNumber}</strong> has been successfully placed.`;
  const html = getBaseHtml(title, message, getOrderDetailsHtml(order));

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: email,
    subject: `Your Fashion Store Order #${order.orderNumber}`,
    html,
  });
}

export async function sendOrderStatusEmail(email: string, name: string, order: IOrder, status: string): Promise<void> {
  const title = 'Order Update';
  let statusMessage = '';
  
  if (status === 'In Progress') {
    statusMessage = `Good news! Your order <strong>#${order.orderNumber}</strong> is currently being prepared.`;
  } else if (status === 'On the Way') {
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been shipped and is on its way to you!`;
  } else if (status === 'Delivered') {
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> has been delivered. We hope you love your new items!`;
  } else {
    statusMessage = `Your order <strong>#${order.orderNumber}</strong> status is now: ${status}.`;
  }

  const message = `Hello ${name},<br><br>${statusMessage}`;
  const html = getBaseHtml(title, message, getOrderDetailsHtml(order));

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: email,
    subject: `Update on your Fashion Store Order #${order.orderNumber}`,
    html,
  });
}

export async function sendOrderCancelledEmail(email: string, name: string, order: IOrder): Promise<void> {
  const title = 'Order Cancelled';
  const message = `Hello ${name},<br><br>Your order <strong>#${order.orderNumber}</strong> has been cancelled as requested. If a payment was made, a refund to your wallet will be processed shortly.`;
  const html = getBaseHtml(title, message, getOrderDetailsHtml(order));

  await resend.emails.send({
    from: env.RESEND_FROM,
    to: email,
    subject: `Order Cancelled: Fashion Store #${order.orderNumber}`,
    html,
  });
}
