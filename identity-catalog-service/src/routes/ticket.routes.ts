import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import * as ticketService from '../services/ticket.service';
import { TicketCategory, TicketPriority } from '../models/Ticket';

export const ticketRoutes = Router();

// Zod schemas
const createTicketSchema = z.object({
  subject: z.string().min(5),
  category: z.enum(['Order Issue', 'Product Issue', 'Payment', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  text: z.string().min(10),
  orderId: z.string().optional(),
});

const messageSchema = z.object({
  text: z.string().min(1),
});

ticketRoutes.post(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = createTicketSchema.parse(req.body);
      const ticket = await ticketService.createTicket(req.userId!, {
        subject: parsed.subject,
        category: parsed.category as TicketCategory,
        priority: parsed.priority as TicketPriority,
        text: parsed.text,
        orderId: parsed.orderId,
      });
      res.status(201).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

ticketRoutes.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tickets = await ticketService.getUserTickets(req.userId!);
      res.json({ success: true, data: tickets });
    } catch (err) {
      next(err);
    }
  }
);

ticketRoutes.get(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.getTicketById(String(req.params.id), req.userId!);
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);

ticketRoutes.post(
  '/:id/message',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = messageSchema.parse(req.body);
      
      const ticket = await ticketService.addMessage(
        String(req.params.id),
        parsed.text,
        'User', 
        false,
        req.userId!
      );
      res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }
);
