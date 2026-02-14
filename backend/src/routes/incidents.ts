import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../db";
import {
  createIncidentSchema,
  updateIncidentSchema,
  querySchema,
} from "../utils/validation";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// create incident
router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createIncidentSchema.parse(req.body);

      const incident = await prisma.incident.create({
        data: {
          title: data.title,
          service: data.service,
          severity: data.severity,
          status: data.status,
          owner: data.owner ?? null,
          summary: data.summary ?? null,
        },
      });

      res.status(201).json(incident);
    } catch (err) {
      next(err);
    }
  }
);

// list incidents (paginated + filters + sort + search)
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = querySchema.parse(req.query);
      const { page, limit, search, severity, status, service, sortBy, sortOrder } =
        query;

      const skip = (page - 1) * limit;

      // build where clause
      const where: Prisma.IncidentWhereInput = {};
      const andConditions: Prisma.IncidentWhereInput[] = [];

      if (search) {
        andConditions.push({
          OR: [
            { title: { contains: search } },
            { service: { contains: search } },
            { owner: { contains: search } },
            { summary: { contains: search } },
          ],
        });
      }

      if (severity) {
        const severities = severity.split(",").map((s) => s.trim());
        andConditions.push({ severity: { in: severities } });
      }

      if (status) {
        const statuses = status.split(",").map((s) => s.trim());
        andConditions.push({ status: { in: statuses } });
      }

      if (service) {
        andConditions.push({ service: { contains: service } });
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      // sorting
      const orderBy: Prisma.IncidentOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      const [incidents, total] = await Promise.all([
        prisma.incident.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.incident.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        data: incidents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// get single incident
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const incident = await prisma.incident.findUnique({
        where: { id },
      });

      if (!incident) {
        throw new AppError("Incident not found", 404);
      }

      res.json(incident);
    } catch (err) {
      next(err);
    }
  }
);

// update incident
router.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = updateIncidentSchema.parse(req.body);

      // 404 if not found
      const existing = await prisma.incident.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError("Incident not found", 404);
      }

      const incident = await prisma.incident.update({
        where: { id },
        data,
      });

      res.json(incident);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
