import { z } from 'zod';

export const createComplaintSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.string().min(2, 'Category is required'),
    subcategory: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    priorityRationale: z.string().optional(),
    departmentId: z.string().optional(),
    institutionId: z.string().optional(), // For admin creating on behalf of an institution
    attachments: z.array(z.object({
      filename: z.string(),
      originalName: z.string(),
      path: z.string().optional(),
      size: z.number().optional(),
      mimetype: z.string().optional(),
    })).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'Submitted',
      'Under Review',
      'In Progress',
      'Awaiting Institution Response',
      'Resolved',
      'Closed',
    ]),
    reason: z.string().optional(),
    resolutionSummary: z.string().optional(),
  }),
});

export const assignComplaintSchema = z.object({
  body: z.object({
    departmentId: z.string().optional(),
    assignedOfficerId: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    deadline: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty'),
    isInternal: z.boolean().default(false),
  }),
});

export const reopenComplaintSchema = z.object({
  body: z.object({
    reason: z.string().min(10, 'A detailed reason (at least 10 characters) is required to reopen this complaint'),
  }),
});
