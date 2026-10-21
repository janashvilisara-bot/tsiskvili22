# TalentOS — სერვერის გამართვის ინსტრუქცია (IT ადმინისთვის)

ეს დოკუმენტი აღწერს თუ როგორ უნდა გავუშვათ TalentOS-ის ცენტრალური სერვერი, რომელსაც კომპანიის ყველა თანამშრომელი დაუკავშირდება Windows-ის `.exe` აპლიკაციით.

---

## 📋 მინიმალური ტექნიკური მოთხოვნები

| რესურსი | მინიმუმი | რეკომენდებული (100+ თანამშრომელი) |
|---|---|---|
| **OS** | Ubuntu 22.04 LTS / Windows Server 2022 | Ubuntu 22.04 LTS |
| **CPU** | 2 cores | 4–8 cores |
| **RAM** | 4 GB | 8–16 GB |
| **დისკი** | 50 GB SSD | 200 GB SSD |
| **ქსელი** | სტატიკური IP | სტატიკური IP + დომენი |
| **Software** | Docker 24+, Docker Compose v2 | + Nginx + Certbot |

---

## 🚀 ნაბიჯი 1 — Docker-ის დაყენება (Ubuntu)

```bash
# სისტემის განახლება
sudo apt update && sudo apt upgrade -y

# Docker-ის ინსტალაცია
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# შემოწმება
docker --version
docker compose version
```

---

## 🗄️ ნაბიჯი 2 — TalentOS Backend-ის გაშვება

```bash
# 1. პროექტის გადმოწერა (ან SCP-ით ატვირთვა)
cd /opt
sudo mkdir talentos && sudo chown $USER:$USER talentos
cd talentos

# 2. გადმოწერეთ აუცილებელი ფაილები:
#    - docker-compose.yml
#    - docker/  (init/, kong.yml, nginx.conf, nginx-reverse-proxy.conf)
#    - supabase/migrations/  (309 ფაილი)
#    - scripts/export-migrations.sh

# 3. .env ფაილის შექმნა (აუცილებლად შეცვალეთ პაროლები!)
cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 64)
ANON_KEY=<გენერირდება JWT_SECRET-ით — იხ. ქვემოთ>
SERVICE_ROLE_KEY=<გენერირდება JWT_SECRET-ით — იხ. ქვემოთ>
EOF
chmod 600 .env

# 4. ყველა migration-ის ერთ ფაილში გაერთიანება
bash scripts/export-migrations.sh

# 5. Docker სტეკის გაშვება
docker compose up -d

# 6. სტატუსის შემოწმება
docker compose ps
curl http://localhost:8000/rest/v1/
```

### 🔑 ANON_KEY და SERVICE_ROLE_KEY გენერაცია

```bash
# Node.js-ით
node -e "
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
console.log('ANON_KEY=' + jwt.sign({role:'anon', iss:'supabase'}, secret, {expiresIn:'10y'}));
console.log('SERVICE_ROLE_KEY=' + jwt.sign({role:'service_role', iss:'supabase'}, secret, {expiresIn:'10y'}));
"
```

დაამატეთ შედეგი `.env`-ში, შემდეგ `docker compose restart`.

---

## 🌐 ნაბიჯი 3 — HTTPS + დომენი (რეკომენდებული)

### A) DNS-ის გამართვა
თქვენი დომენის რეგისტრატორთან დაამატეთ:
```
A    hr.yourcompany.ge    →    <SERVER-IP>
```

### B) Nginx + Let's Encrypt

```bash
# Nginx-ის ინსტალაცია
sudo apt install -y nginx certbot python3-certbot-nginx

# Reverse proxy კონფიგი
sudo cp docker/nginx-reverse-proxy.conf /etc/nginx/sites-available/talentos-api.conf
sudo sed -i 's/hr.yourcompany.ge/hr.YOUR-DOMAIN.ge/g' /etc/nginx/sites-available/talentos-api.conf
sudo ln -s /etc/nginx/sites-available/talentos-api.conf /etc/nginx/sites-enabled/
sudo nginx -t

# SSL სერტიფიკატი
sudo certbot --nginx -d hr.YOUR-DOMAIN.ge

# Nginx-ის გადატვირთვა
sudo systemctl reload nginx
```

შემოწმება:
```bash
curl https://hr.YOUR-DOMAIN.ge/rest/v1/
```

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP (Let's Encrypt)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
# ❌ NOT: port 8000 და 5432 — ეს მხოლოდ Nginx-ით უნდა იყოს ხელმისაწვდომი
```

---

## 💻 ნაბიჯი 4 — Client exe-ის გავრცელება

დეველოპერმა (ერთხელ):
```bash
# electron/config.json:
{
  "SUPABASE_URL": "https://hr.YOUR-DOMAIN.ge",
  "SUPABASE_ANON_KEY": "<ANON_KEY-დან .env-ში>"
}

node electron/build-local-exe.cjs
```

შედეგად მიღებული `TalentOS-win32-x64/` დააარქივეთ და გადააწოდეთ თანამშრომლებს:
- 📁 **Network share**: `\\fileserver\TalentOS\`
- 📦 **Group Policy** Windows-ში — ავტომატური დაყენება ყველა PC-ზე
- 💾 **USB / Email** — მცირე გუნდისთვის

---

## 🔄 ნაბიჯი 5 — Backup და მონიტორინგი

### ყოველდღიური backup (cron)
```bash
sudo crontab -e
# დაამატეთ:
0 2 * * * docker exec talentos-db pg_dump -U postgres postgres | gzip > /backups/talentos-$(date +\%Y\%m\%d).sql.gz
0 3 * * * find /backups -name "talentos-*.sql.gz" -mtime +30 -delete
```

### ლოგების ნახვა
```bash
docker compose logs -f                    # ყველა სერვისი
docker compose logs -f postgres rest      # კონკრეტული
docker stats                              # CPU/RAM გამოყენება
```

### განახლება
```bash
cd /opt/talentos
git pull   # ან ახალი ფაილების ატვირთვა
bash scripts/export-migrations.sh
docker compose up -d
```

---

## ⚠️ უსაფრთხოების Checklist

- [ ] `POSTGRES_PASSWORD` შეცვლილია (არა default)
- [ ] `JWT_SECRET` 64+ სიმბოლო, რანდომული
- [ ] `.env` ფაილს უფლება `chmod 600`
- [ ] Port `5432` (Postgres) **დახურულია** გარე ქსელისთვის
- [ ] Port `8000` (Kong) **დახურულია** გარე ქსელისთვის (მხოლოდ Nginx-დან მისადგომი)
- [ ] HTTPS ჩართულია (port 443), HTTP ავტომატურად ხდება redirect
- [ ] ყოველდღიური automated backup მუშაობს
- [ ] Backup-ები ცალკე ფიზიკურ ლოკაციაზე (off-site) ინახება

---

## 🆘 პრობლემები

| სიმპტომი | მიზეზი | გადაწყვეტა |
|---|---|---|
| `Failed to fetch` exe-ში | Firewall პორტს ხურავს | `sudo ufw allow 443` |
| `Invalid JWT` | ANON_KEY არ ემთხვევა JWT_SECRET-ს | ხელახლა გენერირება, exe rebuild |
| Postgres ვერ ეშვება | მცირე RAM | მინ. 4GB; დაამატეთ swap |
| SSL certificate error | DNS ჯერ არ propagate გახდა | დაელოდეთ 1-24 საათი |
| ნელი მუშაობა | მცირე CPU 100+ user-ზე | scale up + PgBouncer |

---

## 📞 დახმარება

- ლოგების ექსპორტი: `docker compose logs > /tmp/talentos-logs.txt`
- ბაზის სტატუსი: `docker exec talentos-db pg_isready`
- კონფიგის გადამოწმება: `docker compose config`
