#!/usr/bin/env python3
"""
Direct Next.js server startup
This script directly starts the Next.js server on port 5000
"""
import subprocess
import sys
import os
import requests
import threading
import time
from pathlib import Path
from flask import Flask, Response, request as flask_request

def check_node_modules():
    """Check if node_modules exists"""
    if not Path("node_modules").exists():
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], check=True)

def start_nextjs_server():
    """Start Next.js development server"""
    print("Starting Next.js development server on port 5000...")
    
    # Set environment variables
    env = os.environ.copy()
    env["NODE_ENV"] = "development"
    env["PORT"] = "3001"
    env["HOSTNAME"] = "0.0.0.0"
    
    # Start Next.js server directly
    process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3001"],
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr
    )
    
    try:
        process.wait()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    try:
        check_node_modules()
        start_nextjs_server()
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

# Flask app compatibility for gunicorn  
from flask import Flask
import threading
import time

app = Flask(__name__)

# Start Next.js server in background when the module is imported
def start_nextjs_background():
    """Start Next.js in background thread"""
    time.sleep(2)  # Small delay to let Flask start
    check_node_modules()
    start_nextjs_server()

# Start background thread
nextjs_thread = threading.Thread(target=start_nextjs_background)
nextjs_thread.daemon = True
nextjs_thread.start()

@app.route('/', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def root():
    return proxy_to_nextjs('/')

@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_all(path):
    return proxy_to_nextjs(f'/{path}')

def proxy_to_nextjs(path):
    """Proxy requests to Next.js server"""
    try:
        
        url = f"http://localhost:3001{path}"
        
        # Prepare headers
        headers = {k: v for k, v in flask_request.headers if k.lower() != 'host'}
        
        # Forward the request with the correct method
        if flask_request.method == 'GET':
            response = requests.get(
                url,
                params=dict(flask_request.args),
                headers=headers,
                timeout=30,
                allow_redirects=True
            )
        elif flask_request.method == 'POST':
            response = requests.post(
                url,
                params=dict(flask_request.args),
                headers=headers,
                data=flask_request.get_data(),
                timeout=30,
                allow_redirects=True
            )
        elif flask_request.method == 'PUT':
            response = requests.put(
                url,
                params=dict(flask_request.args),
                headers=headers,
                data=flask_request.get_data(),
                timeout=30,
                allow_redirects=True
            )
        elif flask_request.method == 'DELETE':
            response = requests.delete(
                url,
                params=dict(flask_request.args),
                headers=headers,
                timeout=30,
                allow_redirects=True
            )
        elif flask_request.method == 'PATCH':
            response = requests.patch(
                url,
                params=dict(flask_request.args),
                headers=headers,
                data=flask_request.get_data(),
                timeout=30,
                allow_redirects=True
            )
        elif flask_request.method == 'OPTIONS':
            response = requests.options(
                url,
                params=dict(flask_request.args),
                headers=headers,
                timeout=30,
                allow_redirects=True
            )
        else:
            response = requests.get(
                url,
                params=dict(flask_request.args),
                headers=headers,
                timeout=30,
                allow_redirects=True
            )
        
        # Create response with proper headers
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(k, v) for k, v in response.headers.items() 
                  if k.lower() not in excluded_headers]
        
        return Response(response.content, 
                       status=response.status_code,
                       headers=headers)
    except requests.exceptions.ConnectionError:
        return f"""
        <html>
        <head>
            <meta http-equiv="refresh" content="5">
            <title>Starting Next.js...</title>
        </head>
        <body>
            <h1>Starting Next.js Investment Platform...</h1>
            <p>Server is starting up, please wait...</p>
            <p>This page will refresh automatically in 5 seconds.</p>
        </body>
        </html>
        """
    except Exception as e:
        return f"""
        <html>
        <head>
            <meta http-equiv="refresh" content="10">
            <title>Error</title>
        </head>
        <body>
            <h1>Error</h1>
            <p>Error: {str(e)}</p>
            <p>Page will refresh automatically in 10 seconds.</p>
        </body>
        </html>
        """