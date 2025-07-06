document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');

    let selectedFile = null;

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Validate file
    function validateFile(file) {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
        
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 100MB.');
            return false;
        }
        
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.zip')) {
            alert('Only ZIP files are allowed.');
            return false;
        }
        
        return true;
    }

    // Handle file selection
    function handleFileSelect(file) {
        if (!validateFile(file)) {
            return;
        }

        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        dropZone.style.display = 'none';
        fileInfo.style.display = 'block';
        uploadBtn.disabled = false;
        
        // Add selected class to drop zone
        dropZone.classList.add('file-selected');
    }

    // Reset file selection
    function resetFileSelection() {
        selectedFile = null;
        fileInput.value = '';
        dropZone.style.display = 'block';
        fileInfo.style.display = 'none';
        uploadBtn.disabled = true;
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        
        // Remove selected class
        dropZone.classList.remove('file-selected');
    }

    // Click to select file
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Remove file
    removeFile.addEventListener('click', function() {
        resetFileSelection();
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // Form submission
    uploadForm.addEventListener('submit', function(e) {
        if (!selectedFile) {
            e.preventDefault();
            alert('Please select a ZIP file to upload.');
            return;
        }

        // Show progress
        progressContainer.style.display = 'block';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

        // Simulate progress (since we can't track real progress with standard form submission)
        let progress = 0;
        const progressInterval = setInterval(function() {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
            }
            progressBar.style.width = progress + '%';
        }, 100);

        // Clean up on page unload
        window.addEventListener('beforeunload', function() {
            clearInterval(progressInterval);
        });
    });

    // Prevent default drag behaviors on document
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    document.addEventListener('drop', function(e) {
        e.preventDefault();
    });

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});
