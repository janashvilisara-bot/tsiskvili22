const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const out = path.join(process.cwd(), 'public', 'offline-seed.json');
const appTables = [
  'account_lockouts','advertisements','announcements','assets','attendance','attendance_devices','audit_logs','backup_history','backup_schedules','badges','benefit_plans','budget_expenses','budget_plans','business_trip_requests','call_recordings','candidates','changelog_items','changelog_releases','chat_messages','chat_participants','chat_rooms','companies','company_features','company_packages','compensation','compliance_reports','compliance_snapshots','contacts','contract_templates','contracts','custom_roles','data_breaches','data_classifications','deals','departments','disciplinary_actions','document_signatures','document_templates','documents','dpia_assessments','dsr_requests','employee_badges','employee_benefit_enrollments','employee_evaluations','employee_feedback','employee_history','employee_onboarding','employee_points','employee_risk_assessments','employees','esim_plans','esim_requests','events','feature_definitions','feature_packages','insurance_companies','integration_settings','job_descriptions','job_vacancies','knowledge_base','leave_requests','leave_types','location_alerts','login_history','medical_checkups','notifications','office_locations','onboarding_task_completion','onboarding_tasks','onboarding_templates','organization_info','overtime_requests','password_policies','payroll','pension_payments','point_transactions','positions','processing_activities','profiles','projects','public_holidays','recognitions','reward_catalog','reward_redemptions','role_permissions','safety_training_records','schedule_templates','security_events','security_incidents','service_trips','shift_schedules','shift_templates','signify_signing_requests','sms_logs','sms_notification_settings','support_tickets','task_comments','tasks','team_challenges','training_courses','training_participants','ui_texts','user_consents','user_custom_roles','user_favorites','user_presence','user_roles','vehicle_requests','video_call_participants','video_calls','video_tutorials','webrtc_signals','wellness_survey_responses','wellness_surveys','work_schedules','work_time_form_generations'
];

const runPsqlJson = (query) => {
  const raw = execFileSync('psql', ['-At', '-c', query], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 128 * 1024 * 1024 }).trim();
  return raw ? JSON.parse(raw) : null;
};

const tableExists = (table) => runPsqlJson(`select to_jsonb(to_regclass('public.${table}') is not null)::text`) === true;
const exportTable = (table) => runPsqlJson(`select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text from public.${table} t`);

try {
  const tables = {};
  for (const table of appTables) {
    if (!tableExists(table)) continue;
    try {
      tables[table] = exportTable(table);
      console.log(`Exported ${table}: ${tables[table].length} rows`);
    } catch (error) {
      console.log(`Skipped ${table}: ${String(error.message || error).split('\n')[0]}`);
      tables[table] = [];
    }
  }

  let storageObjects = [];
  try {
    storageObjects = runPsqlJson(`select coalesce(jsonb_agg(to_jsonb(o)), '[]'::jsonb)::text from storage.objects o`) || [];
  } catch (error) {
    console.log('Skipped storage object metadata export');
  }

  const seed = {
    exportedAt: new Date().toISOString(),
    source: 'cloud-full-export',
    offlineMode: 'local-server-stack',
    tables,
    storageObjects,
    employees: tables.employees || [],
    departments: tables.departments || [],
    workSchedules: tables.work_schedules || [],
    publicHolidays: tables.public_holidays || [],
  };

  fs.writeFileSync(out, `${JSON.stringify(seed, null, 2)}\n`);
  console.log(`Wrote full offline seed ${out}`);
} catch (error) {
  const empty = { exportedAt: new Date().toISOString(), source: 'empty-fallback', offlineMode: 'local-server-stack', tables: {}, storageObjects: [], employees: [], departments: [], workSchedules: [], publicHolidays: [] };
  fs.writeFileSync(out, `${JSON.stringify(empty, null, 2)}\n`);
  console.log(`Wrote empty fallback ${out}`);
}
