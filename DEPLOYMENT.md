# Deployment Guide

## One-Command Deployment on EC2

### Step 1: Launch EC2 Instance
- Instance: `t2.micro` (free tier) or `t3.small`
- AMI: Ubuntu 22.04 LTS
- Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Storage: 20 GB

### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Clone & Deploy
```bash
# Clone repository
git clone <your-repo-url>
cd Auction-app

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

That's it! Your app is live at `http://your-ec2-ip`

---

## Manual Deployment (Alternative)

### Install Dependencies
```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

### Deploy Application
```bash
# Navigate to project
cd Auction-app

# Start services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Environment Configuration

Edit `docker-compose.yml` before deployment:

```yaml
backend:
  environment:
    JWT_SECRET: your-production-secret-key-here
    CORS_ORIGINS: http://your-domain.com
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access database
docker exec -it auction_db psql -U auction_user -d auction_db

# Access Redis CLI
docker exec -it auction_redis redis-cli

# Remove all data (fresh start)
docker-compose down -v
```

---

## Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

---

## SSL/HTTPS Setup (Optional)

### Using Certbot
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory
free -h
```

---

## Troubleshooting

### Services not starting
```bash
docker-compose logs
```

### Port already in use
```bash
sudo lsof -i :80
sudo lsof -i :8000
```

### Database connection issues
```bash
docker exec -it auction_db psql -U auction_user -d auction_db
```

### Clear everything and restart
```bash
docker-compose down -v
docker system prune -a
./deploy.sh
```

---

## Production Checklist

- [ ] Change JWT_SECRET in docker-compose.yml
- [ ] Update CORS_ORIGINS with your domain
- [ ] Configure security group (ports 22, 80, 443)
- [ ] Set up SSL certificate
- [ ] Enable automated backups for database
- [ ] Set up monitoring/alerts
- [ ] Configure log rotation
