import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const SERVICES = [
  "api-gateway",
  "auth-service",
  "payment-service",
  "user-service",
  "notification-service",
  "search-service",
  "inventory-service",
  "order-service",
  "billing-service",
  "analytics-service",
  "cdn-edge",
  "database-primary",
  "cache-cluster",
  "message-queue",
  "load-balancer",
];

const SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"];
const STATUSES = ["OPEN", "MITIGATED", "RESOLVED"];

const OWNERS = [
  "karthik.m",
  "priya.nair",
  "arjun.reddy",
  "divya.s",
  "vijay.kumar",
  "meena.raj",
  "suresh.pillai",
  "ananya.k",
  "ravi.shankar",
  "lakshmi.v",
  null,
  null,
];

const TITLE_PREFIXES = [
  "High latency detected in",
  "Service degradation on",
  "Connection timeout in",
  "Memory leak detected in",
  "CPU spike observed on",
  "Disk space critical on",
  "SSL cert expiring for",
  "DB connection pool exhausted in",
  "Rate limiting triggered on",
  "Health check failures on",
  "Deployment rollback needed for",
  "Data inconsistency found in",
  "Error rate spike in",
  "Queue backlog growing on",
  "DNS resolution failures for",
  "Network partition detected in",
  "Cascading failure from",
  "Unauth access attempt on",
  "Config drift detected in",
  "Resource quota exceeded on",
];

const SUMMARIES = [
  "Dashboards showing elevated error rates since ~14:30 UTC. Got a few support tickets about it too. Looking into root cause now.",
  "p99 latency went past 5s, alerts fired. Looks like it started after the last deploy. Rolling back to be safe while we investigate.",
  "Health checks failing across multiple AZs. LB already pulled the bad instances, ASG is spinning up new ones. Keeping an eye on it.",
  "Replication lag spiked hard, some users seeing stale data. DBA team is on it, checking slow queries and replication setup.",
  "Memory usage hit 90%+ on prod boxes. GC pauses causing dropped requests. Scaling out horizontally as a stopgap.",
  "Third-party API flapping with 503s. Turned on circuit breaker for now, pinged the vendor. Waiting on their response.",
  "Found a cache invalidation bug, stale data getting served. Know which code path is broken, hotfix in progress. Flushed cache manually.",
  "Seeing tons of 429s from the gateway. Rate limits look correct so might be bot traffic or some client doing a retry storm.",
  "Noticed this during on-call handoff. Doesn't seem customer-facing yet but worth tracking. Will dig in tomorrow morning.",
  "Not 100% sure this is real yet. Grafana shows a blip but could be a metrics pipeline delay. Keeping the ticket open to watch.",
  null,
  null,
  null,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDate(daysAgoStart: number, daysAgoEnd: number): Date {
  const now = Date.now();
  const from = now - daysAgoStart * 86400000;
  const to = now - daysAgoEnd * 86400000;
  return new Date(from + Math.random() * (to - from));
}

async function main() {
  console.log("seeding 200 incidents...");

  await prisma.incident.deleteMany();

  const rows = Array.from({ length: 200 }, () => {
    const svc = pick(SERVICES);
    const created = randDate(180, 0);
    const updated = new Date(
      created.getTime() + Math.random() * 7 * 86400000
    );

    return {
      id: uuidv4(),
      title: `${pick(TITLE_PREFIXES)} ${svc}`,
      service: svc,
      severity: pick(SEVERITIES),
      status: pick(STATUSES),
      owner: pick(OWNERS),
      summary: pick(SUMMARIES),
      createdAt: created,
      updatedAt: updated > new Date() ? new Date() : updated,
    };
  });

  for (let i = 0; i < rows.length; i += 50) {
    await prisma.incident.createMany({ data: rows.slice(i, i + 50) });
    console.log(`  ${Math.min(i + 50, 200)} / 200`);
  }

  console.log("done.");
}

main()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
