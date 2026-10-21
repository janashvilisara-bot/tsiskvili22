# TalentOS — ლოკალური განთავსება (On-Premise)

ეს დოკუმენტი აღწერს თუ როგორ უნდა გაუშვათ TalentOS **სრულად ლოკალურ სერვერზე** Docker-ით, Lovable Cloud-ის გარეშე.

## არქიტექტურა

```
[ TalentOS.exe (Electron) ]  ─→  [ Docker stack ]
  • Frontend (React)                 • PostgreSQL 15
  • Local config.json                • PostgREST (Data API)
                                     • GoTrue (Auth)
                                     • Kong (Gateway, port 8000)
                                     • Storage / Realtime
```

---

## ნაბიჯი 1 — ლოკალური ბაზის გაშვება

```bash
# 1. ყველა migration-ის ერთ ფაილში გაერთიანება
bash scripts/export-migrations.sh

# 2. სრული Supabase სტეკის გაშვება
docker compose up -d

# 3. შემოწმება
curl http://localhost:8000/rest/v1/
```

ნაგულისხმევი მისამართები:
- **API Gateway:** `http://<server-ip>:8000`
- **Postgres:** `<server-ip>:5432` (user: `postgres`, password: `.env`-ში)
- **JWT Secret / Anon Key:** `docker-compose.yml`-ის environment ცვლადებში

⚠️ **შეცვალეთ ნაგულისხმევი პაროლები** პროდუქციაში (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`).

---

## ნაბიჯი 2 — Electron exe-ის ლოკალურ ბაზაზე გადართვა

```bash
# 1. კონფიგურაციის შაბლონის კოპირება
cp electron/config.example.json electron/config.json
```

გახსენით `electron/config.json` და ჩაწერეთ:
```json
{
  "SUPABASE_URL": "http://192.168.1.100:8000",
  "SUPABASE_ANON_KEY": "თქვენი-ლოკალური-anon-key",
  "MODE": "local"
}
```

```bash
# 2. exe-ის აშენება ლოკალური პარამეტრებით
node electron/build-local-exe.cjs
```

შედეგი: `electron-release/TalentOS-win32-x64/TalentOS.exe` — გაუშვით Windows-ზე.

> სკრიპტი ავტომატურად ინახავს ღრუბლოვან `.env`-ს (`.env.cloud.backup`) და build-ის შემდეგ ააღდგენს, ანუ Lovable-ში development არ ფუჭდება.

---

## ფაილები

| ფაილი | დანიშნულება |
|---|---|
| `docker-compose.yml` | სრული Supabase სტეკი (Postgres + REST + Auth + Kong + Storage) |
| `docker/init/*.sql` | Supabase base + auth + storage სქემები |
| `docker/init/99-app-migrations.sql` | ⚙️ `export-migrations.sh`-ით გენერირდება (309 migration) |
| `scripts/export-migrations.sh` | აერთიანებს ყველა migration-ს ერთ init ფაილში |
| `electron/config.example.json` | კონფიგურაციის შაბლონი |
| `electron/build-local-exe.cjs` | აშენებს exe-ს ლოკალურ ბაზაზე |

---

## ხშირი პრობლემები

**`Failed to fetch`** → შეამოწმეთ რომ `SUPABASE_URL` Windows-იდან მისადგომია (firewall, port 8000 ღია).

**Auth არ მუშაობს** → `GOTRUE_JWT_SECRET` უნდა ემთხვეოდეს `PGRST_JWT_SECRET`-ს და კლიენტის `ANON_KEY` უნდა იყოს იმავე secret-ით ხელმოწერილი.

**Edge Functions არ მუშაობს** → ლოკალურად საჭიროა ცალკე `supabase functions serve` ან Deno-ში deploy. ეს არ შედის ამ პაკეტში.
