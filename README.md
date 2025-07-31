# Get Any Country - Web Application

A modern web application that allows users to search, filter, and explore countries using the REST Countries API. The application features a responsive design with search functionality, regional filtering, alphabetical filtering, and population-based filtering.

## Features

- **Country Search**: Search for countries by name
- **Regional Filtering**: Filter countries by region (Africa, Americas, Asia, Europe, Oceania)
- **Alphabetical Filtering**: Filter countries by the first letter of their name
- **Population Filtering**: Filter countries by population size categories
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Fetches data from the REST Countries API
- **Interactive UI**: Hover effects and smooth transitions

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: REST Countries API (https://restcountries.com/)
- **Container**: Docker with Nginx
- **Load Balancer**: HAProxy

## Project Structure

```
Web_Infrastructure_APIs/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # JavaScript functionality
├── Dockerfile          # Docker configuration
├── nginx.conf          # Nginx server configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Containerization

### Prerequisites

- Docker installed on your machine
- Docker Hub account (for publishing the image)

### Building the Docker Image

1. **Build the image locally:**
   ```bash
   docker build -t <your-dockerhub-username>/get-any-country:v1 .
   ```

2. **Test the image locally:**
   ```bash
   docker run -p 8080:8080 <your-dockerhub-username>/get-any-country:v1
   ```

3. **Verify the application works:**
   ```bash
   curl http://localhost:8080
   ```

### Publishing to Docker Hub

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Push the image:**
   ```bash
   docker push <your-dockerhub-username>/get-any-country:v1
   ```

## Lab Environment Deployment

This application is designed to be deployed in a three-container lab environment with load balancing capabilities.

### Lab Setup

The lab environment consists of:
- **web-01**: First web server (IP: 172.20.0.11)
- **web-02**: Second web server (IP: 172.20.0.12)  
- **lb-01**: Load balancer (IP: 172.20.0.10)

### Deployment Steps

#### 1. Clone the Lab Repository

```bash
git clone https://github.com/waka-man/web_infra_lab.git
cd web_infra_lab
```

#### 2. Start the Lab Environment

```bash
docker compose up -d --build
```

#### 3. Verify Container Status

```bash
docker compose ps
```

You should see all three containers running:
- web-01 (SSH: 2211, HTTP: 8080)
- web-02 (SSH: 2212, HTTP: 8081)
- lb-01 (SSH: 2210, HTTP: 8082)

#### 4. Deploy Application on Web Servers

**SSH into web-01:**
```bash
ssh ubuntu@localhost -p 2211
# Password: pass123
```

**Install Docker and deploy the application:**
```bash
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker ubuntu
newgrp docker

# Pull and run the application
docker pull <your-dockerhub-username>/get-any-country:v1
docker run -d --name app --restart unless-stopped -p 8080:8080 <your-dockerhub-username>/get-any-country:v1
```

**Repeat the same steps for web-02:**
```bash
ssh ubuntu@localhost -p 2212
# Password: pass123
# Follow the same Docker installation and deployment steps
```

#### 5. Configure HAProxy Load Balancer

**SSH into lb-01:**
```bash
ssh ubuntu@localhost -p 2210
# Password: pass123
```

**Install HAProxy:**
```bash
sudo apt update
sudo apt install -y haproxy
```

**Configure HAProxy:**
```bash
sudo nano /etc/haproxy/haproxy.cfg
```

**Replace the content with:**
```haproxy
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s

frontend http-in
    bind *:80
    default_backend webapps

backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
    http-response set-header X-Served-By %[srv_name]
```

**Restart HAProxy:**
```bash
sudo systemctl restart haproxy
```

#### 6. Test the Load Balancer

From your host machine, test the load balancer:

```bash
# Test multiple requests to see load balancing in action
curl -I http://localhost:8082
curl -I http://localhost:8082
curl -I http://localhost:8082
```

You should see the `X-Served-By` header alternating between `web01` and `web02`.

### Verification Steps

1. **Test individual web servers:**
   ```bash
   curl http://localhost:8080  # web-01
   curl http://localhost:8081  # web-02
   ```

2. **Test load balancer:**
   ```bash
   curl http://localhost:8082
   ```

3. **Check load balancing:**
   ```bash
   for i in {1..10}; do
     echo "Request $i:"
     curl -s -I http://localhost:8082 | grep X-Served-By
   done
   ```

## Configuration Details

### Docker Configuration

- **Base Image**: nginx:alpine (lightweight and secure)
- **Port**: 8080 (configurable)
- **Health Check**: Built-in health check endpoint at `/health`
- **Security**: Security headers and CORS configuration

### Nginx Configuration

- **Port**: 8080
- **Compression**: Gzip enabled for better performance
- **Caching**: Static assets cached for 1 year
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **CORS**: Configured for API calls to REST Countries

### HAProxy Configuration

- **Load Balancing Algorithm**: Round Robin
- **Health Checks**: Enabled for both backend servers
- **Custom Header**: X-Served-By header to identify which server handled the request
- **Timeout Settings**: Optimized for web traffic

## Troubleshooting

### Common Issues

1. **Container won't start:**
   - Check if port 8080 is available
   - Verify Docker is running
   - Check container logs: `docker logs <container-name>`

2. **Load balancer not working:**
   - Verify HAProxy is running: `sudo systemctl status haproxy`
   - Check HAProxy logs: `sudo journalctl -u haproxy`
   - Verify backend servers are reachable

3. **Application not accessible:**
   - Check if containers are running: `docker ps`
   - Verify port mappings: `docker port <container-name>`
   - Test internal connectivity between containers

### Useful Commands

```bash
# Check container status
docker compose ps

# View container logs
docker logs <container-name>

# SSH into containers
ssh ubuntu@localhost -p 2211  # web-01
ssh ubuntu@localhost -p 2212  # web-02
ssh ubuntu@localhost -p 2210  # lb-01

# Check HAProxy status
sudo systemctl status haproxy

# Test load balancing
curl -I http://localhost:8082
```

## Security Considerations

- **Container Security**: Using Alpine Linux base image for smaller attack surface
- **Network Security**: Containers isolated in custom Docker network
- **Application Security**: Security headers configured in Nginx
- **Access Control**: SSH access with password authentication

## Performance Optimization

- **Gzip Compression**: Enabled for text-based assets
- **Static Asset Caching**: Long-term caching for CSS, JS, and images
- **Load Balancing**: Round-robin distribution for better resource utilization
- **Health Checks**: Automatic failover for unhealthy instances

## Future Enhancements

- **SSL/TLS**: Add HTTPS support with Let's Encrypt
- **Monitoring**: Integrate with monitoring tools (Prometheus, Grafana)
- **Auto-scaling**: Implement container orchestration with Kubernetes
- **CI/CD**: Set up automated deployment pipeline

## License

This project is open source and available under the MIT License.

## Author

ArnoldEloiBM - [GitHub Profile](https://github.com/ArnoldEloiBM)

---

**Note**: Make sure to replace `<your-dockerhub-username>` with your actual Docker Hub username throughout this documentation. 