import { NextResponse } from "next/server";
import { WorkflowEngine } from "@/lib/workflow-engine";

export async function POST(request: Request) {
  try {
    const { input, triggeredBy } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Natural language input query is required" },
        { status: 400 }
      );
    }

    const result = await WorkflowEngine.runGeneralWorkflow(
      input,
      triggeredBy || "HR System"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Workflow Execution API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute workflow" },
      { status: 500 }
    );
  }
}

// Fetch workflow logs for the workflow history view
export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const logs = await prisma.workflowLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
