import { Router, Request, Response, NextFunction } from 'express';
import { db, launchPlans, tasks, kpis, kpiEntries, taskDependencies, contacts, outreachEvents, alerts, assets, notes } from '@launch-tracker/db';
import { createPlanSchema, updatePlanSchema, createTaskSchema, updateTaskSchema, createKpiSchema, createKpiEntrySchema, createContactSchema, updateContactSchema, createOutreachEventSchema, resolveAlertSchema, createAssetSchema, createNoteSchema } from '@launch-tracker/shared';
import { eq, and, sql, asc, desc } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { FEB_2026_LAUNCH_TEMPLATE, DEFAULT_KPIS } from '@launch-tracker/db/templates';
import { addDays } from '@launch-tracker/shared';

export const plansRouter = Router();

// All routes require authentication
plansRouter.use(authenticate);

// ============================================
// PLANS CRUD
// ============================================

// List all plans for the current user
plansRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userPlans = await db.query.launchPlans.findMany({
      where: eq(launchPlans.userId, req.user!.userId),
      orderBy: [desc(launchPlans.createdAt)],
    });

    res.json({ data: userPlans, success: true });
  } catch (error) {
    next(error);
  }
});

// Get available templates
plansRouter.get('/templates', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 'feb-2026-launch',
        name: 'Feb 1-14, 2026 Launch Calendar',
        description: 'A 14-day launch plan with tasks for soft launch, outreach, cold list warm-up, and conversion push.',
        taskCount: FEB_2026_LAUNCH_TEMPLATE.length,
        kpiCount: DEFAULT_KPIS.length,
      },
    ],
    success: true,
  });
});

// Create a new plan
plansRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createPlanSchema.parse(req.body);

    const [plan] = await db.insert(launchPlans).values({
      userId: req.user!.userId,
      name: input.name,
      timezone: input.timezone,
      startDate: input.startDate,
      endDate: input.endDate,
      strategyTags: input.strategyTags,
      notes: input.notes,
      status: 'draft',
    }).returning();

    // If template specified, apply it
    if (input.templateId === 'feb-2026-launch') {
      // Create tasks from template
      const taskValues = FEB_2026_LAUNCH_TEMPLATE.map(t => ({
        planId: plan.id,
        title: t.title,
        description: t.description || null,
        dueDate: addDays(input.startDate, t.dayOffset),
        estimatedMinutes: t.estimatedMinutes || null,
        status: 'not_started',
        priority: t.priority,
        category: t.category,
      }));

      await db.insert(tasks).values(taskValues);

      // Create default KPIs
      const kpiValues = DEFAULT_KPIS.map(k => ({
        planId: plan.id,
        name: k.name,
        category: k.category,
        unit: k.unit,
        targetType: k.targetType,
        targetValue: k.targetValue,
        calculationType: 'manual',
      }));

      await db.insert(kpis).values(kpiValues);
    }

    res.status(201).json({ data: plan, success: true });
  } catch (error) {
    next(error);
  }
});

// Get a single plan
plansRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    const plan = await db.query.launchPlans.findFirst({
      where: and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ),
    });

    if (!plan) {
      throw new AppError(404, 'Plan not found');
    }

    res.json({ data: plan, success: true });
  } catch (error) {
    next(error);
  }
});

// Update a plan
plansRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = updatePlanSchema.parse(req.body);

    const [updated] = await db.update(launchPlans)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ))
      .returning();

    if (!updated) {
      throw new AppError(404, 'Plan not found');
    }

    res.json({ data: updated, success: true });
  } catch (error) {
    next(error);
  }
});

// Delete a plan
plansRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    const [deleted] = await db.delete(launchPlans)
      .where(and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ))
      .returning();

    if (!deleted) {
      throw new AppError(404, 'Plan not found');
    }

    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// CALENDAR
// ============================================

// Get calendar data for a plan
plansRouter.get('/:id/calendar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    // Verify plan ownership
    const plan = await db.query.launchPlans.findFirst({
      where: and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ),
    });

    if (!plan) {
      throw new AppError(404, 'Plan not found');
    }

    // Get tasks grouped by date with completion stats
    const taskStats = await db.select({
      date: tasks.dueDate,
      totalTasks: sql<number>`count(*)::int`,
      completedTasks: sql<number>`count(*) filter (where ${tasks.status} = 'complete')::int`,
      hasBlockedTasks: sql<boolean>`bool_or(${tasks.status} = 'blocked')`,
      hasCriticalPriorityTasks: sql<boolean>`bool_or(${tasks.priority} = 'high')`,
    })
      .from(tasks)
      .where(eq(tasks.planId, planId))
      .groupBy(tasks.dueDate)
      .orderBy(asc(tasks.dueDate));

    // Get alerts by date
    const alertsByDate = await db.select({
      date: alerts.dateTriggered,
      hasAlerts: sql<boolean>`true`,
    })
      .from(alerts)
      .where(and(
        eq(alerts.planId, planId),
        sql`${alerts.resolvedAt} IS NULL`
      ))
      .groupBy(alerts.dateTriggered);

    const alertDates = new Set(alertsByDate.map(a => a.date));

    const days = taskStats.map(day => ({
      date: day.date,
      totalTasks: day.totalTasks,
      completedTasks: day.completedTasks,
      completionPercent: day.totalTasks > 0 ? Math.round((day.completedTasks / day.totalTasks) * 100) : 0,
      hasBlockedTasks: day.hasBlockedTasks || false,
      hasCriticalPriorityTasks: day.hasCriticalPriorityTasks || false,
      hasAlerts: alertDates.has(day.date),
    }));

    res.json({
      data: {
        planId: plan.id,
        startDate: plan.startDate,
        endDate: plan.endDate,
        days,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// Get tasks for a specific day
plansRouter.get('/:id/day/:date', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { date } = req.params;

    // Verify plan ownership
    const plan = await db.query.launchPlans.findFirst({
      where: and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ),
    });

    if (!plan) {
      throw new AppError(404, 'Plan not found');
    }

    const dayTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.planId, planId),
        eq(tasks.dueDate, date)
      ),
      orderBy: [
        desc(tasks.priority),
        asc(tasks.createdAt),
      ],
    });

    // Get dependencies for these tasks
    const taskIds = dayTasks.map(t => t.id);
    const dependencies = taskIds.length > 0
      ? await db.query.taskDependencies.findMany({
          where: sql`${taskDependencies.taskId} IN (${sql.join(taskIds.map(id => sql`${id}`), sql`, `)})`,
        })
      : [];

    // Get blocking tasks
    const blockingTaskIds = dependencies.map(d => d.dependsOnTaskId);
    const blockingTasks = blockingTaskIds.length > 0
      ? await db.query.tasks.findMany({
          where: sql`${tasks.id} IN (${sql.join(blockingTaskIds.map(id => sql`${id}`), sql`, `)})`,
        })
      : [];

    // Group tasks by priority for the daily checklist view
    const mustDo = dayTasks.filter(t => t.priority === 'high');
    const shouldDo = dayTasks.filter(t => t.priority === 'medium');
    const optional = dayTasks.filter(t => t.priority === 'low');

    res.json({
      data: {
        date,
        tasks: dayTasks,
        grouped: {
          mustDo,
          shouldDo,
          optional,
        },
        dependencies,
        blockingTasks,
        summary: {
          total: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'complete').length,
          blocked: dayTasks.filter(t => t.status === 'blocked').length,
        },
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// TASKS CRUD
// ============================================

// List tasks for a plan
plansRouter.get('/:id/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { status, priority, category, date } = req.query;

    // Build where conditions
    const conditions = [eq(tasks.planId, planId)];
    if (status) conditions.push(eq(tasks.status, status as string));
    if (priority) conditions.push(eq(tasks.priority, priority as string));
    if (category) conditions.push(eq(tasks.category, category as string));
    if (date) conditions.push(eq(tasks.dueDate, date as string));

    const planTasks = await db.query.tasks.findMany({
      where: and(...conditions),
      orderBy: [asc(tasks.dueDate), desc(tasks.priority)],
    });

    res.json({ data: planTasks, success: true });
  } catch (error) {
    next(error);
  }
});

// Create a task
plansRouter.post('/:id/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createTaskSchema.parse(req.body);

    const [task] = await db.insert(tasks).values({
      planId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      estimatedMinutes: input.estimatedMinutes,
      status: input.status,
      priority: input.priority,
      category: input.category,
      ownerId: input.ownerId,
      links: input.links,
    }).returning();

    // Create dependencies if provided
    if (input.dependsOn && input.dependsOn.length > 0) {
      await db.insert(taskDependencies).values(
        input.dependsOn.map(depId => ({
          taskId: task.id,
          dependsOnTaskId: depId,
        }))
      );
    }

    res.status(201).json({ data: task, success: true });
  } catch (error) {
    next(error);
  }
});

// Update a task
plansRouter.patch('/:id/tasks/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const input = updateTaskSchema.parse(req.body);

    const updateData: Record<string, unknown> = { ...input, updatedAt: new Date() };

    // If marking as complete, set completedAt
    if (input.status === 'complete') {
      updateData.completedAt = new Date();
    }

    const [updated] = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updated) {
      throw new AppError(404, 'Task not found');
    }

    res.json({ data: updated, success: true });
  } catch (error) {
    next(error);
  }
});

// Quick complete a task
plansRouter.post('/:id/tasks/:taskId/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { completionNotes } = req.body;

    const [updated] = await db.update(tasks)
      .set({
        status: 'complete',
        completedAt: new Date(),
        completionNotes,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updated) {
      throw new AppError(404, 'Task not found');
    }

    res.json({ data: updated, success: true });
  } catch (error) {
    next(error);
  }
});

// Delete a task
plansRouter.delete('/:id/tasks/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);

    await db.delete(tasks).where(eq(tasks.id, taskId));

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// KPIS CRUD
// ============================================

// List KPIs for a plan
plansRouter.get('/:id/kpis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    const planKpis = await db.query.kpis.findMany({
      where: eq(kpis.planId, planId),
      with: {
        entries: {
          orderBy: [desc(kpiEntries.date)],
          limit: 7, // Last 7 entries for trend
        },
      },
    });

    // Calculate status for each KPI
    const kpisWithStatus = planKpis.map(kpi => {
      const latestEntry = kpi.entries[0];
      let status: 'green' | 'yellow' | 'red' = 'green';

      if (latestEntry) {
        const value = latestEntry.value;
        const target = kpi.targetValue;
        const warningThreshold = target * 0.1;

        if (kpi.targetType === 'minimum') {
          if (value >= target) status = 'green';
          else if (value >= target - warningThreshold) status = 'yellow';
          else status = 'red';
        } else {
          if (value <= target) status = 'green';
          else if (value <= target + warningThreshold) status = 'yellow';
          else status = 'red';
        }
      }

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (kpi.entries.length >= 2) {
        const recent = kpi.entries[0].value;
        const previous = kpi.entries[1].value;
        const change = ((recent - previous) / (previous || 1)) * 100;
        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';
      }

      return {
        ...kpi,
        latestValue: latestEntry?.value ?? null,
        latestDate: latestEntry?.date ?? null,
        status,
        trend,
      };
    });

    res.json({ data: kpisWithStatus, success: true });
  } catch (error) {
    next(error);
  }
});

// Create a KPI
plansRouter.post('/:id/kpis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createKpiSchema.parse(req.body);

    const [kpi] = await db.insert(kpis).values({
      planId,
      ...input,
    }).returning();

    res.status(201).json({ data: kpi, success: true });
  } catch (error) {
    next(error);
  }
});

// Add KPI entry
plansRouter.post('/:id/kpis/:kpiId/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const kpiId = parseInt(req.params.kpiId);
    const input = createKpiEntrySchema.parse(req.body);

    // Upsert - update if entry exists for this date, otherwise insert
    const existing = await db.query.kpiEntries.findFirst({
      where: and(
        eq(kpiEntries.kpiId, kpiId),
        eq(kpiEntries.date, input.date)
      ),
    });

    let entry;
    if (existing) {
      [entry] = await db.update(kpiEntries)
        .set({ value: input.value, notes: input.notes })
        .where(eq(kpiEntries.id, existing.id))
        .returning();
    } else {
      [entry] = await db.insert(kpiEntries).values({
        planId,
        kpiId,
        date: input.date,
        value: input.value,
        notes: input.notes,
      }).returning();
    }

    // Check if this triggers an alert
    const kpi = await db.query.kpis.findFirst({
      where: eq(kpis.id, kpiId),
    });

    if (kpi) {
      const shouldAlert = kpi.targetType === 'minimum'
        ? input.value < kpi.targetValue * 0.9 // 10% below minimum
        : input.value > kpi.targetValue * 1.1; // 10% above maximum

      if (shouldAlert) {
        await db.insert(alerts).values({
          planId,
          kpiId,
          dateTriggered: input.date,
          severity: 'warning',
          message: `${kpi.name} is outside target range: ${input.value} (target: ${kpi.targetType} ${kpi.targetValue})`,
        });
      }
    }

    res.status(201).json({ data: entry, success: true });
  } catch (error) {
    next(error);
  }
});

// Get KPI entries
plansRouter.get('/:id/kpis/:kpiId/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpiId = parseInt(req.params.kpiId);

    const entries = await db.query.kpiEntries.findMany({
      where: eq(kpiEntries.kpiId, kpiId),
      orderBy: [asc(kpiEntries.date)],
    });

    res.json({ data: entries, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ALERTS
// ============================================

// List alerts for a plan
plansRouter.get('/:id/alerts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { resolved } = req.query;

    const conditions = [eq(alerts.planId, planId)];
    if (resolved === 'false') {
      conditions.push(sql`${alerts.resolvedAt} IS NULL`);
    }

    const planAlerts = await db.query.alerts.findMany({
      where: and(...conditions),
      orderBy: [desc(alerts.createdAt)],
      with: {
        kpi: true,
      },
    });

    res.json({ data: planAlerts, success: true });
  } catch (error) {
    next(error);
  }
});

// Resolve an alert
plansRouter.post('/:id/alerts/:alertId/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alertId = parseInt(req.params.alertId);
    const { resolutionNotes } = resolveAlertSchema.parse(req.body);

    const [updated] = await db.update(alerts)
      .set({
        resolvedAt: new Date(),
        resolutionNotes,
      })
      .where(eq(alerts.id, alertId))
      .returning();

    if (!updated) {
      throw new AppError(404, 'Alert not found');
    }

    res.json({ data: updated, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// CONTACTS
// ============================================

// List contacts
plansRouter.get('/:id/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { segment, status } = req.query;

    const conditions = [eq(contacts.planId, planId)];
    if (segment) conditions.push(eq(contacts.segment, segment as string));
    if (status) conditions.push(eq(contacts.status, status as string));

    const planContacts = await db.query.contacts.findMany({
      where: and(...conditions),
      orderBy: [asc(contacts.email)],
    });

    res.json({ data: planContacts, success: true });
  } catch (error) {
    next(error);
  }
});

// Create contact
plansRouter.post('/:id/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createContactSchema.parse(req.body);

    const [contact] = await db.insert(contacts).values({
      planId,
      ...input,
    }).returning();

    res.status(201).json({ data: contact, success: true });
  } catch (error) {
    next(error);
  }
});

// Bulk import contacts
plansRouter.post('/:id/contacts/import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { contacts: contactList } = req.body;

    if (!Array.isArray(contactList)) {
      throw new AppError(400, 'contacts must be an array');
    }

    const values = contactList.map(c => ({
      planId,
      email: c.email,
      name: c.name || null,
      segment: c.segment,
      tags: c.tags || [],
      status: 'not_contacted',
    }));

    const imported = await db.insert(contacts).values(values).returning();

    res.status(201).json({
      data: imported,
      success: true,
      message: `Imported ${imported.length} contacts`,
    });
  } catch (error) {
    next(error);
  }
});

// Update contact
plansRouter.patch('/:id/contacts/:contactId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contactId = parseInt(req.params.contactId);
    const input = updateContactSchema.parse(req.body);

    const [updated] = await db.update(contacts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(contacts.id, contactId))
      .returning();

    if (!updated) {
      throw new AppError(404, 'Contact not found');
    }

    res.json({ data: updated, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// OUTREACH EVENTS
// ============================================

// Create outreach event
plansRouter.post('/:id/outreach-events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createOutreachEventSchema.parse(req.body);

    const [event] = await db.insert(outreachEvents).values({
      planId,
      ...input,
    }).returning();

    // Update contact status to contacted if it was not_contacted
    await db.update(contacts)
      .set({ status: 'contacted', updatedAt: new Date() })
      .where(and(
        eq(contacts.id, input.contactId),
        eq(contacts.status, 'not_contacted')
      ));

    res.status(201).json({ data: event, success: true });
  } catch (error) {
    next(error);
  }
});

// Get outreach events
plansRouter.get('/:id/outreach-events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    const events = await db.query.outreachEvents.findMany({
      where: eq(outreachEvents.planId, planId),
      orderBy: [desc(outreachEvents.date)],
      with: {
        contact: true,
      },
    });

    res.json({ data: events, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// ASSETS
// ============================================

// List assets
plansRouter.get('/:id/assets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    const planAssets = await db.query.assets.findMany({
      where: eq(assets.planId, planId),
      orderBy: [desc(assets.createdAt)],
    });

    res.json({ data: planAssets, success: true });
  } catch (error) {
    next(error);
  }
});

// Create asset
plansRouter.post('/:id/assets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createAssetSchema.parse(req.body);

    const [asset] = await db.insert(assets).values({
      planId,
      ...input,
    }).returning();

    res.status(201).json({ data: asset, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// NOTES
// ============================================

// List notes
plansRouter.get('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const { linkedType, linkedId } = req.query;

    const conditions = [eq(notes.planId, planId)];
    if (linkedType) conditions.push(eq(notes.linkedType, linkedType as string));
    if (linkedId) conditions.push(eq(notes.linkedId, linkedId as string));

    const planNotes = await db.query.notes.findMany({
      where: and(...conditions),
      orderBy: [desc(notes.createdAt)],
    });

    res.json({ data: planNotes, success: true });
  } catch (error) {
    next(error);
  }
});

// Create note
plansRouter.post('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);
    const input = createNoteSchema.parse(req.body);

    const [note] = await db.insert(notes).values({
      planId,
      linkedType: input.linkedType,
      linkedId: String(input.linkedId),
      content: input.content,
    }).returning();

    res.status(201).json({ data: note, success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// REPORTS
// ============================================

// Get report data
plansRouter.get('/:id/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    // Verify plan ownership
    const plan = await db.query.launchPlans.findFirst({
      where: and(
        eq(launchPlans.id, planId),
        eq(launchPlans.userId, req.user!.userId)
      ),
    });

    if (!plan) {
      throw new AppError(404, 'Plan not found');
    }

    // Get task completion summary
    const taskSummary = await db.select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${tasks.status} = 'complete')::int`,
      skipped: sql<number>`count(*) filter (where ${tasks.status} = 'skipped')::int`,
      blocked: sql<number>`count(*) filter (where ${tasks.status} = 'blocked')::int`,
    })
      .from(tasks)
      .where(eq(tasks.planId, planId));

    // Get KPI final values
    const kpiData = await db.query.kpis.findMany({
      where: eq(kpis.planId, planId),
      with: {
        entries: {
          orderBy: [desc(kpiEntries.date)],
          limit: 1,
        },
      },
    });

    // Get outreach funnel
    const contactStats = await db.select({
      segment: contacts.segment,
      total: sql<number>`count(*)::int`,
      contacted: sql<number>`count(*) filter (where ${contacts.status} != 'not_contacted')::int`,
      replied: sql<number>`count(*) filter (where ${contacts.status} in ('replied', 'booked_call', 'started_trial', 'paid_starter', 'paid_pro'))::int`,
      converted: sql<number>`count(*) filter (where ${contacts.status} in ('paid_starter', 'paid_pro'))::int`,
    })
      .from(contacts)
      .where(eq(contacts.planId, planId))
      .groupBy(contacts.segment);

    // Get learnings (notes)
    const learnings = await db.query.notes.findMany({
      where: eq(notes.planId, planId),
      orderBy: [desc(notes.createdAt)],
    });

    res.json({
      data: {
        plan,
        taskSummary: taskSummary[0],
        kpis: kpiData.map(k => ({
          name: k.name,
          category: k.category,
          unit: k.unit,
          targetType: k.targetType,
          targetValue: k.targetValue,
          finalValue: k.entries[0]?.value ?? null,
        })),
        outreachFunnel: contactStats,
        learnings,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

// Export to CSV
plansRouter.get('/:id/export/csv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const planId = parseInt(req.params.id);

    // Get all KPI entries
    const entries = await db.query.kpiEntries.findMany({
      where: eq(kpiEntries.planId, planId),
      with: {
        kpi: true,
      },
      orderBy: [asc(kpiEntries.date)],
    });

    // Generate CSV
    const headers = ['Date', 'KPI Name', 'Category', 'Value', 'Unit', 'Notes'];
    const rows = entries.map(e => [
      e.date,
      e.kpi.name,
      e.kpi.category,
      e.value,
      e.kpi.unit,
      e.notes || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=launch-kpis-${planId}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});
