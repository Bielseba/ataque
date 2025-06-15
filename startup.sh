apt update -y
apt install -y nodejs npm git ufw

git clone https://github.com/Bielseba/ataque.git /home/ataque
cd /home/ataque

ufw allow 80
ufw allow 443
ufw --force enable

# Executa ataque.js em segundo plano com log
nohup node ataque.js > /var/log/ataque.log 2>&1 &
