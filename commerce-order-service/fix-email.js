const mongoose = require('mongoose');
const { Resend } = require('resend');

mongoose.connect('mongodb+srv://aayushrajput3105_db_user:AtDGpE0F2ar6nTEf@project1orderservice.r8pv2ir.mongodb.net/');
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

const resend = new Resend('re_8A89rViQ_4rZF55SSRXhe7zP1kbf3pb7s');

function getBaseHtml(title, message, orderHtml) {
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

function getOrderDetailsHtml(order) {
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

async function run() {
  const order = await Order.findOne({}).sort({ createdAt: -1 });
  if (order) {
    order.userEmail = 'ykme14@gmail.com';
    order.userName = 'Aayush';
    await order.save();
    
    console.log('Sending email...');
    
    const title = 'Order Confirmed!';
    const message = `Hello Aayush,<br><br>Thank you for shopping with us! Your order <strong>#${order.orderNumber}</strong> has been successfully placed.`;
    const html = getBaseHtml(title, message, getOrderDetailsHtml(order));

    try {
      const resp = await resend.emails.send({
        from: 'noreply@aayushatmars.in',
        to: 'ykme14@gmail.com',
        subject: `Your Fashion Store Order #${order.orderNumber}`,
        html,
      });
      console.log('Email sent successfully:', resp);
    } catch (e) {
      console.error('Error sending email:', e);
    }
  }
  process.exit(0);
}

run();
