# Investpromax Project Setup

## Overview

InvestPro - это современная инвестиционная платформа, построенная на Next.js 15 с использованием TypeScript и PostgreSQL в качестве базы данных. Платформа предоставляет полный функционал для управления инвестициями, пользователями и администрирования. Проект полностью переустановлен из архива и готов к работе.

## System Architecture

### Setup and Import Layer
- **Setup Scripts**: Automated project import and configuration management
- **Environment Verification**: Pre-flight checks for system compatibility
- **Configuration Management**: Centralized configuration handling with defaults

### Core Components
- **Project Importer**: Git-based repository cloning and project initialization
- **Environment Checker**: System requirements validation (Python version, Git availability)
- **Configuration Manager**: JSON-based configuration with environment variable support
- **Server Starter**: Multi-platform server detection and startup automation

## Key Components

### Configuration System
- **File**: `config.py` - Centralized configuration management
- **Purpose**: Manages application settings with JSON-based storage and environment variable fallbacks
- **Features**: Default configuration generation, file-based persistence, environment-aware settings

### Import and Setup
- **Files**: `setup.py`, `import_project.py`
- **Purpose**: Automated project cloning from GitHub repository
- **Features**: Git repository management, backup creation, multi-stage import process

### Environment Validation
- **File**: `check_environment.py`
- **Purpose**: System compatibility verification
- **Features**: Python version checking, Git availability validation, dependency verification

### Server Management
- **File**: `start_server.py`
- **Purpose**: Intelligent server detection and startup
- **Features**: Multi-language support (Python/Node.js), automatic main file detection

## Data Flow

1. **Initialization**: User runs `setup.py` to begin project import
2. **Environment Check**: System validates Python version and Git availability
3. **Repository Clone**: Project imports Investpromax from GitHub
4. **Configuration**: Default settings are applied with environment customization
5. **Server Detection**: System identifies and prepares appropriate server startup
6. **Deployment**: Application launches with configured parameters

## External Dependencies

### GitHub Integration
- **Repository**: `https://github.com/KHUDOYDOD/Investpromax.git`
- **Method**: Git-based cloning and synchronization
- **Backup Strategy**: Automatic backup creation before import

### Python Dependencies
- **GitPython**: Git repository management
- **Requests**: HTTP client for API interactions
- **Standard Library**: JSON, subprocess, pathlib for core functionality

### System Requirements
- **Python**: 3.7+ (configured for 3.11)
- **Git**: Required for repository operations
- **Operating System**: Cross-platform support (Unix/Windows)

## Deployment Strategy

### Development Environment
- **Database**: SQLite default with PostgreSQL support
- **Server**: Development server with hot reload
- **Configuration**: Debug mode enabled, permissive CORS settings

### Configuration Flexibility
- **Environment Variables**: Support for DATABASE_URL, SECRET_KEY, JWT_SECRET
- **Port Configuration**: Separate frontend (5000) and backend (8000) ports
- **Security**: Configurable secrets with development defaults

### Multi-Stage Setup
1. **Pre-flight Checks**: Environment validation
2. **Repository Import**: Git-based project cloning
3. **Configuration Application**: Settings initialization
4. **Server Preparation**: Application startup preparation

## Recent Changes

✓ Создано простое Flask веб-приложение для загрузки ZIP архивов
✓ Установлен пользователем архив с инвестиционной платформой  
✓ Извлечен проект Next.js из папки invest
✓ Настроена PostgreSQL база данных для инвестиционной платформы
✓ Установлены все зависимости Node.js для Next.js приложения
✓ Запущен Next.js сервер на порту 3001 с Flask прокси на порту 5000
✓ Исправлен Flask прокси для поддержки всех HTTP методов (POST, PUT, DELETE)
✓ Подключено реальное API к PostgreSQL базе данных
✓ Исправлены пароли пользователей и настроена аутентификация
✓ Регистрация и вход в систему работают с реальной базой данных
✓ Добавлены тестовые данные: пользователи, транзакции, инвестиционные планы  

## Changelog

\`\`\`
Changelog:
- June 24, 2025. Initial setup and import from GitHub
- June 24, 2025. Database setup and authentication system implementation
\`\`\`

## User Preferences

\`\`\`
Preferred communication style: Simple, everyday language.
\`\`\`

## Technical Notes

- The system is designed to work with both Python and Node.js applications
- Database configuration supports SQLite for development with easy PostgreSQL migration
- Security settings use development-friendly defaults that should be changed for production
- The import system creates automatic backups to prevent data loss during setup
- Server detection is intelligent and can identify common application entry points
