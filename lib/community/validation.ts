import { z } from "zod";

export const CreateReportSchema = z.object({
  lat:        z.number().min(-90).max(90),
  lng:        z.number().min(-180).max(180),
  heatLevel:  z.number().int().min(1).max(5),
  shadeLevel: z.enum(["none", "partial", "good"]),
  comment:    z.string().max(300).optional(),
  deviceTemp: z.number().min(-20).max(80).optional(),
  areaHash:   z.string().min(1).max(20),
  hashedUser: z.string().min(1).max(64),
});

export type ValidatedReport = z.infer<typeof CreateReportSchema>;
