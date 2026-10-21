# TalentOS - საინსტალაციო გზამკვლევი

## წინაპირობები

სერვერზე ინსტალაციამდე დარწმუნდით რომ გაქვთ:

1. **Docker** (ვერსია 20.10+)
   - Linux: `curl -fsSL https://get.docker.com | sh`
   - Windows: [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
   - Mac: [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)

2. **Docker Compose** (ვერსია 2.0+)
   - Linux-ზე ჩვეულებრივ ავტომატურად დაყენდება Docker-თან ერთად

3. **მინიმალური სისტემური მოთხოვნები:**
   - RAM: 4GB (რეკომენდირებული 8GB)
   - დისკი: 20GB თავისუფალი ადგილი
   - CPU: 2 ბირთვი

## სწრაფი ინსტალაცია

### Linux / Mac

```bash
# 1. გადმოწერეთ პროექტი
git clone https://github.com/your-repo/talentos.git
cd talentos

# 2. გაუშვით ინსტალატორი
chmod +x install.sh
./install.sh
```

### Windows

```batch
# 1. გადმოწერეთ პროექტი
git clone https://github.com/your-repo/talentos.git
cd talentos

# 2. გაუშვით ინსტალატორი
install.bat
```

## ხელით ინსტალაცია

თუ გსურთ თითოეული ნაბიჯის ხელით შესრულება:

### 1. კონფიგურაციის შექმნა

```bash
# დააკოპირეთ მაგალითის ფაილი
cp docker/.env.example .env

# შეცვალეთ პარამეტრები
nano .env
```

### 2. Docker კონტეინერების აშენება

```bash
docker-compose build
```

### 3. სერვისების გაშვება

```bash
docker-compose up -d
```

### 4. სტატუსის შემოწმება

```bash
docker-compose ps
```

## კონფიგურაცია

### მთავარი პარამეტრები (.env)

| პარამეტრი | აღწერა |
|-----------|--------|
| `POSTGRES_PASSWORD` | მონაცემთა ბაზის პაროლი |
| `JWT_SECRET` | JWT ტოკენის საიდუმლო გასაღები (მინ. 32 სიმბოლო) |
| `ANON_KEY` | Supabase ანონიმური გასაღები |
| `SERVICE_ROLE_KEY` | Supabase სერვისის გასაღები |
| `SITE_URL` | აპლიკაციის URL |

### SMS კონფიგურაცია (Twilio)

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+995xxxxx
```

### Email კონფიგურაცია (Resend)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## პორტები

| სერვისი | პორტი | აღწერა |
|---------|-------|--------|
| აპლიკაცია | 3000 | ვებ ინტერფეისი |
| API Gateway | 8000 | Supabase API |
| PostgreSQL | 5432 | მონაცემთა ბაზა |

## სერვისების მართვა

```bash
# ლოგების ნახვა
docker-compose logs -f

# კონკრეტული სერვისის ლოგი
docker-compose logs -f app

# სერვისების გაჩერება
docker-compose stop

# სერვისების გაშვება
docker-compose start

# სერვისების გადატვირთვა
docker-compose restart

# სერვისების წაშლა (მონაცემები შენარჩუნდება)
docker-compose down

# სრული წაშლა (მონაცემებით)
docker-compose down -v
```

## მონაცემთა ბაზის სარეზერვო კოპირება

### სარეზერვო კოპიის შექმნა

```bash
docker-compose exec postgres pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### სარეზერვო კოპიიდან აღდგენა

```bash
docker-compose exec -T postgres psql -U postgres postgres < backup_20240101.sql
```

## პრობლემების მოგვარება

### სერვისი არ იშვება

```bash
# შეამოწმეთ ლოგები
docker-compose logs service_name

# შეამოწმეთ რესურსები
docker stats
```

### პორტი დაკავებულია

```bash
# Linux/Mac: შეამოწმეთ რა იყენებს პორტს
lsof -i :3000

# Windows:
netstat -ano | findstr :3000
```

### მონაცემთა ბაზასთან კავშირის პრობლემა

```bash
# PostgreSQL სტატუსი
docker-compose exec postgres pg_isready

# ხელით დაკავშირება
docker-compose exec postgres psql -U postgres
```

## უსაფრთხოება

⚠️ **მნიშვნელოვანი:**

1. შეცვალეთ ყველა default პაროლი
2. გამოიყენეთ ძლიერი JWT_SECRET (მინ. 64 სიმბოლო)
3. პროდაქშენზე გამოიყენეთ HTTPS
4. დახურეთ 5432 პორტი გარე წვდომისთვის

## განახლება

```bash
# ახალი ვერსიის გადმოწერა
git pull

# კონტეინერების ხელახლა აშენება
docker-compose build

# სერვისების გადატვირთვა
docker-compose up -d
```

## მხარდაჭერა

პრობლემების შემთხვევაში:
- შეამოწმეთ ლოგები: `docker-compose logs`
- გახსენით Issue GitHub-ზე
- დაგვიკავშირდით: support@talentos.ge
