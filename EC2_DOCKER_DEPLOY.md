# Deploy the Local Docker Image to EC2

This path makes EC2 run the same Docker image that works on your local machine.

## 1. Prepare EC2 Once

SSH into EC2:

```bash
ssh -i tourista-kp.pem ec2-user@3.107.112.6
```

Install Docker if needed:

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit
```

Log in again so the Docker group takes effect:

```bash
ssh -i tourista-kp.pem ec2-user@3.107.112.6
docker ps
```

## 2. Create the Production Env File Locally

Create `.env.production` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

Use the same database URL that worked for your app.

## 3. Deploy From Windows PowerShell

From the project folder:

```powershell
.\deploy-local-image.ps1 `
  -HostName 3.107.112.6 `
  -User ec2-user `
  -KeyPath .\tourista-kp.pem `
  -EnvFile .\.env.production
```

The script will:

- build a Linux AMD64 image locally
- save it as a Docker tar file
- upload it to EC2
- upload `.env.production`
- load the image on EC2
- restart `tourista-app`
- keep uploads in a persistent Docker volume

## 4. Check the App

Open:

```text
http://3.107.112.6
```

Check logs:

```bash
ssh -i tourista-kp.pem ec2-user@3.107.112.6
docker logs tourista-app --tail 100
docker ps
```

## Required AWS Rules

Security group inbound rules:

```text
SSH   TCP 22  Your IP or 0.0.0.0/0 temporarily
HTTP  TCP 80  0.0.0.0/0
HTTPS TCP 443 0.0.0.0/0
```

Use an Elastic IP for the instance if you want `3.107.112.6` to stay stable after stop/start.
