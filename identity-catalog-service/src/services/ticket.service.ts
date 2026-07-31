import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../models/Ticket';
import { User } from '../models/User';
import { createError } from '../middlewares/error.middleware';

// ─── Create Ticket ─────────────────────────────────────────────────────────────

export async function createTicket(userId: string, data: { subject: string; category: TicketCategory; priority: TicketPriority; text: string; orderId?: string }) {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', 404, 'USER_NOT_FOUND');

  // Set SLA based on priority
  const slaHours = data.priority === 'High' ? 24 : data.priority === 'Medium' ? 48 : 72;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const ticket = await Ticket.create({
    userId,
    orderId: data.orderId,
    subject: data.subject,
    category: data.category,
    priority: data.priority,
    status: 'Open',
    slaDeadline,
    messages: [
      {
        text: data.text,
        isAdmin: false,
        senderName: user.name,
        createdAt: new Date(),
      },
    ],
  });

  return ticket;
}

// ─── Get User Tickets ─────────────────────────────────────────────────────────

export async function getUserTickets(userId: string) {
  return Ticket.find({ userId }).sort({ updatedAt: -1 });
}

// ─── Get Single Ticket ────────────────────────────────────────────────────────

export async function getTicketById(ticketId: string, userId?: string) {
  const query: any = { _id: ticketId };
  if (userId) query.userId = userId;

  const ticket = await Ticket.findOne(query).populate('userId', 'name email avatar');
  if (!ticket) throw createError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  return ticket;
}

// ─── Add Message to Ticket ────────────────────────────────────────────────────

export async function addMessage(ticketId: string, text: string, senderName: string, isAdmin: boolean, userId?: string) {
  const query: any = { _id: ticketId };
  if (userId) query.userId = userId;

  const ticket = await Ticket.findOne(query);
  if (!ticket) throw createError('Ticket not found', 404, 'TICKET_NOT_FOUND');

  if (ticket.status === 'Closed') {
    throw createError('Cannot reply to a closed ticket', 400, 'TICKET_CLOSED');
  }

  ticket.messages.push({
    text,
    isAdmin,
    senderName,
    createdAt: new Date(),
  });

  // If user replies, update status to Open (from Resolved/In Progress)
  if (!isAdmin && ticket.status !== 'Escalated') {
    ticket.status = 'Open';
  }

  // Update SLA to be relative to this new message? Or keep initial SLA?
  // Let's keep initial SLA for now.

  await ticket.save();
  return ticket;
}

// ─── Admin: List Tickets ──────────────────────────────────────────────────────

export async function adminListTickets(filters: { status?: string; priority?: string; page?: number; limit?: number }) {
  const { status, priority, page = 1, limit = 20 } = filters;
  const query: any = {};
  if (status && status !== 'All') query.status = status;
  if (priority && priority !== 'All') query.priority = priority;

  const total = await Ticket.countDocuments(query);
  const tickets = await Ticket.find(query)
    .populate('userId', 'name email')
    .sort({ updatedAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    tickets,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
}

// ─── Admin: Update Ticket ─────────────────────────────────────────────────────

export async function adminUpdateTicket(ticketId: string, data: { status?: TicketStatus; priority?: TicketPriority }) {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw createError('Ticket not found', 404, 'TICKET_NOT_FOUND');

  if (data.status) ticket.status = data.status;
  if (data.priority) {
    ticket.priority = data.priority;
    // Re-adjust SLA? Not necessarily, let's keep it simple.
  }

  await ticket.save();
  return ticket;
}
