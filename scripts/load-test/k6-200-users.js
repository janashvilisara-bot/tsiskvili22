// k6 run -e USERS=200 -e TOKEN=<access token> scripts/load-test/k6-200-users.js
import http from "k6/http";
import { sleep, check } from "k6";

const URL = __ENV.SUPABASE_URL || "https://fookshkjpwnqxszwykdv.supabase.co";
const ANON = __ENV.ANON_KEY;
const TOKEN = __ENV.TOKEN;
const USERS = Number(__ENV.USERS || 200);

export const options = {
  stages: [
    { duration: "2m", target: USERS },
    { duration: "3m", target: USERS },
    { duration: "30s", target: 0 },
  ],
  thresholds: { http_req_duration: ["p(95)<1000"], http_req_failed: ["rate<0.01"] },
};

const PATHS = [
  "employees?select=id,full_name,position&limit=50",
  "attendance?select=id,check_in&order=check_in.desc&limit=30",
  "leave_requests?select=id,status&limit=30",
  "notifications?select=id,title&order=created_at.desc&limit=20",
  "announcements?select=id,title&limit=10",
];

export default function () {
  const headers = { apikey: ANON, Authorization: `Bearer ${TOKEN || ANON}` };
  for (const p of PATHS) {
    const r = http.get(`${URL}/rest/v1/${p}`, { headers });
    check(r, { ok: (x) => x.status === 200 });
    sleep(0.5 + Math.random());
  }
}
