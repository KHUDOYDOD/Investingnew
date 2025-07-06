import os
import zipfile
import logging
from datetime import datetime
from flask import Flask, request, render_template, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configuration
UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
ALLOWED_EXTENSIONS = {'zip'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EXTRACT_FOLDER'] = EXTRACT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_zip(file_path):
    """Validate if file is a valid ZIP archive"""
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            # Test the ZIP file integrity
            zip_ref.testzip()
            return True
    except (zipfile.BadZipFile, RuntimeError):
        return False

def get_file_list(directory):
    """Get list of files in directory recursively"""
    file_list = []
    if os.path.exists(directory):
        for root, dirs, files in os.walk(directory):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, directory)
                file_size = os.path.getsize(full_path)
                file_list.append({
                    'name': rel_path,
                    'size': file_size,
                    'size_formatted': format_file_size(file_size)
                })
    return file_list

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.1f} {size_names[i]}"

@app.route('/')
def index():
    """Main page with upload form"""
    extracted_files = get_file_list(EXTRACT_FOLDER)
    return render_template('index.html', extracted_files=extracted_files)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and extraction"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            flash('No file selected', 'error')
            return redirect(url_for('index'))
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(url_for('index'))
        
        # Validate file type
        if not allowed_file(file.filename):
            flash('Only ZIP files are allowed', 'error')
            return redirect(url_for('index'))
        
        # Secure the filename
        filename = secure_filename(file.filename)
        if not filename:
            flash('Invalid filename', 'error')
            return redirect(url_for('index'))
        
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        # Save uploaded file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Validate ZIP file
        if not is_valid_zip(file_path):
            os.remove(file_path)  # Clean up invalid file
            flash('Invalid ZIP file or corrupted archive', 'error')
            return redirect(url_for('index'))
        
        # Extract ZIP file
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                # Create extraction directory
                extract_path = os.path.join(app.config['EXTRACT_FOLDER'], timestamp)
                os.makedirs(extract_path, exist_ok=True)
                
                # Extract all files
                zip_ref.extractall(extract_path)
                
                # Get extraction info
                file_count = len(zip_ref.namelist())
                
            # Clean up uploaded ZIP file
            os.remove(file_path)
            
            flash(f'Successfully extracted {file_count} files from {file.filename}', 'success')
            app.logger.info(f'Successfully extracted ZIP file: {filename}')
            
        except Exception as e:
            # Clean up on extraction error
            if os.path.exists(file_path):
                os.remove(file_path)
            flash(f'Error extracting ZIP file: {str(e)}', 'error')
            app.logger.error(f'Error extracting ZIP file: {str(e)}')
            
    except RequestEntityTooLarge:
        flash('File too large. Maximum size is 100MB', 'error')
    except Exception as e:
        flash(f'Upload failed: {str(e)}', 'error')
        app.logger.error(f'Upload error: {str(e)}')
    
    return redirect(url_for('index'))

@app.route('/clear', methods=['POST'])
def clear_files():
    """Clear all extracted files"""
    try:
        # Remove all files in extract folder
        for root, dirs, files in os.walk(EXTRACT_FOLDER, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            for dir in dirs:
                os.rmdir(os.path.join(root, dir))
        
        flash('All extracted files cleared successfully', 'success')
        app.logger.info('All extracted files cleared')
        
    except Exception as e:
        flash(f'Error clearing files: {str(e)}', 'error')
        app.logger.error(f'Error clearing files: {str(e)}')
    
    return redirect(url_for('index'))

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    flash('File too large. Maximum size is 100MB', 'error')
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    flash('Internal server error occurred', 'error')
    return redirect(url_for('index'))
