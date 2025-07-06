# ZIP Archive Extractor

## Overview

This is a Flask-based web application that allows users to upload and extract ZIP archives through a web interface. The application provides a simple drag-and-drop interface for file uploads and displays the extracted contents. It's designed as a utility tool for easily handling ZIP files in a web environment.

## System Architecture

The application follows a simple client-server architecture:

- **Frontend**: HTML templates with Bootstrap for styling and JavaScript for interactive features
- **Backend**: Flask web framework handling file uploads and ZIP extraction
- **File Storage**: Local file system for temporary storage of uploaded and extracted files
- **No Database**: The application is stateless and doesn't persist data between sessions

## Key Components

### Backend (Flask)
- **app.py**: Main application file containing Flask routes and business logic
- **main.py**: Application entry point for running the Flask server
- File upload handling with validation and security measures
- ZIP extraction functionality with error handling
- Session-based flash messaging for user feedback

### Frontend
- **templates/index.html**: Main user interface with drag-and-drop upload area
- **static/css/style.css**: Custom styling for the application
- **static/js/upload.js**: Client-side JavaScript for file handling and progress tracking
- Bootstrap framework for responsive design and dark theme support

### Security Features
- File extension validation (ZIP files only)
- File size limits (100MB maximum)
- Secure filename handling using Werkzeug utilities
- ZIP file integrity validation

## Data Flow

1. User accesses the web interface
2. User selects or drags a ZIP file to the upload area
3. Client-side validation checks file type and size
4. File is uploaded to the server via POST request
5. Server validates the file and extracts contents
6. Extracted files are stored in the local file system
7. User receives feedback about the operation status
8. File listing is displayed to the user

## External Dependencies

### Python Packages
- **Flask**: Web framework for handling HTTP requests and responses
- **Werkzeug**: Utilities for secure file handling and web development
- **zipfile**: Built-in Python module for ZIP archive handling
- **os**: Built-in module for file system operations

### Frontend Dependencies
- **Bootstrap**: CSS framework for responsive design and components
- **Font Awesome**: Icon library for enhanced UI elements
- **Custom CSS/JS**: Application-specific styling and functionality

## Deployment Strategy

The application is configured for deployment on Replit:
- Uses environment variables for configuration (SESSION_SECRET)
- Runs on host '0.0.0.0' and port 5000
- Debug mode enabled for development
- Automatic directory creation for upload and extraction folders

### Configuration
- Upload folder: 'uploads'
- Extract folder: 'extracted'
- Maximum file size: 100MB
- Allowed file types: ZIP archives only

## Changelog
- July 06, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.