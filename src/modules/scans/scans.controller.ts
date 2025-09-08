// src/modules/scans/scans.controller.ts
import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import multer from "multer";
import { AuthedRequest } from "../../middleware/auth";
import { openai } from "../../services/openai";
import { uploadBufferToCloudinary } from "../../utils/uploader";

const prisma = new PrismaClient();
export const upload = [
  multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single("image"),
  async (req: AuthedRequest, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "image file required" });
    
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, "aieyecare/scans");

      // AI analysis on the hosted image (structured JSON)
      const analysis = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are a medical-education assistant (not a doctor). Respond ONLY with valid JSON, no additional text or markdown formatting." 
          },
          { 
            role: "user", 
            content: `Analyze this eye image URL: ${result.secure_url}. Return STRICT JSON with exactly these keys:
            - "summary": string (<=120 words)
            - "findings": array of objects with keys: "name", "description", "confidence" (number 0-100), "severity" ("low"|"medium"|"high")
            - "recommendations": array of strings
            
            Example format:
            {
              "summary": "Brief analysis summary",
              "findings": [{"name": "Finding Name", "description": "Description", "confidence": 85, "severity": "medium"}],
              "recommendations": ["Recommendation 1", "Recommendation 2"]
            }` 
          }
        ],
        temperature: 0.2
      });

      const content = analysis.choices[0].message?.content?.trim() || "";
      console.log("Raw AI response:", content);

      let summary: string | null = null;
      let findings: any[] = [];
      let recommendations: string[] = [];
      let aiFindings: any = null;

      try {
        // Remove any potential markdown code block markers
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanContent);
        
        console.log("Parsed JSON:", parsed);
        
        summary = parsed?.summary || null;
        findings = Array.isArray(parsed?.findings) ? parsed.findings : [];
        recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
        
        // Structure the aiFindings object to match what your mobile app expects
        aiFindings = {
          findings: findings,
          recommendations: recommendations
        };
        
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        console.error("Content that failed to parse:", content);
        
        // Fallback: treat the entire response as summary
        summary = content || null;
        aiFindings = null;
      }

      const lastScan = await prisma.scan.findFirst({ 
        where: { userId: req.user!.id }, 
        orderBy: { createdAt: "desc" }
      });
      
      console.log("Final summary:", summary);
      console.log("Final aiFindings:", aiFindings);
      
      const scan = await prisma.scan.create({
        data: {
          userId: req.user!.id,
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          aiSummary: summary,
          aiFindings: aiFindings,
          comparedWith: lastScan?.id
        }
      });
      
      res.status(201).json(scan);
      
    } catch (error) {
      console.error("Upload/analysis error:", error);
      res.status(500).json({ message: "Failed to process image" });
    }
  }
];

export const getById = async (req: AuthedRequest, res: Response) => {
  const scan = await prisma.scan.findUnique({ where: { id: req.params.id } });
  if (!scan) return res.status(404).json({ message: "Not found" });
  res.json(scan);
};

export const listByUser = async (req: AuthedRequest, res: Response) => {
  const items = await prisma.scan.findMany({ where: { userId: req.params.userId }, orderBy: { createdAt: "desc" } });
  res.json(items);
};

export const remove = async (req: AuthedRequest, res: Response) => {
  await prisma.scan.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
