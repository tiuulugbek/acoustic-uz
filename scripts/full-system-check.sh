#!/bin/bash

# To'liq tizim tekshiruvi - barcha xatoliklarni aniqlash

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
ADMIN_DIR="$PROJECT_DIR/apps/admin"

REPORT_FILE="/tmp/acoustic-system-check-$(date +%Y%m%d_%H%M%S).txt"

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Xulosa
ERRORS=0
WARNINGS=0
SUCCESS=0

# Log funksiyasi
log() {
    echo -e "$1" | tee -a "$REPORT_FILE"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
    ((SUCCESS++))
}

log_error() {
    log "${RED}❌ $1${NC}"
    ((ERRORS++))
}

log_warning() {
    log "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

log_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

log_section() {
    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "${BLUE}📋 $1${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 1. Environment va konfiguratsiya tekshiruvi
check_environment() {
    log_section "1. Environment va Konfiguratsiya Tekshiruvi"
    
    # Backend .env
    if [ -f "$BACKEND_DIR/.env" ]; then
        log_success ".env fayl mavjud: $BACKEND_DIR/.env"
        
        # DATABASE_URL
        if grep -q "^DATABASE_URL=" "$BACKEND_DIR/.env"; then
            log_success "DATABASE_URL topildi"
        else
            log_error "DATABASE_URL topilmadi"
        fi
        
        # TELEGRAM_BOT_TOKEN
        if grep -q "^TELEGRAM_BOT_TOKEN=" "$BACKEND_DIR/.env"; then
            log_success "TELEGRAM_BOT_TOKEN topildi"
        else
            log_warning "TELEGRAM_BOT_TOKEN topilmadi"
        fi
        
        # TELEGRAM_CHAT_ID
        if grep -q "^TELEGRAM_CHAT_ID=" "$BACKEND_DIR/.env"; then
            log_success "TELEGRAM_CHAT_ID topildi"
        else
            log_warning "TELEGRAM_CHAT_ID topilmadi"
        fi
    else
        log_error ".env fayl topilmadi: $BACKEND_DIR/.env"
    fi
    
    # Frontend .env
    if [ -f "$FRONTEND_DIR/.env" ] || [ -f "$FRONTEND_DIR/.env.local" ]; then
        log_success "Frontend .env fayl mavjud"
    else
        log_warning "Frontend .env fayl topilmadi (shart emas)"
    fi
}

# 2. Database tekshiruvi
check_database() {
    log_section "2. Database Tekshiruvi"
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        export $(grep -v '^#' "$BACKEND_DIR/.env" | grep -E '^DATABASE_URL=' | xargs)
        
        if [ -n "${DATABASE_URL:-}" ]; then
            # PostgreSQL connection test
            if command -v psql &> /dev/null; then
                if timeout 5 psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
                    log_success "Database'ga ulanish muvaffaqiyatli"
                    
                    # Database hajmi
                    DB_SIZE=$(psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs)
                    if [ -n "$DB_SIZE" ]; then
                        log_info "Database hajmi: $DB_SIZE"
                    fi
                else
                    log_error "Database'ga ulanish xatolik"
                fi
            else
                log_warning "psql topilmadi"
            fi
        else
            log_error "DATABASE_URL o'qib bo'lmadi"
        fi
    else
        log_warning "Database tekshiruvi o'tkazilmadi (.env topilmadi)"
    fi
}

# 3. Build fayllar tekshiruvi
check_builds() {
    log_section "3. Build Fayllar Tekshiruvi"
    
    # Frontend build
    if [ -d "$FRONTEND_DIR/.next" ]; then
        NEXT_SIZE=$(du -sh "$FRONTEND_DIR/.next" 2>/dev/null | cut -f1)
        NEXT_FILES=$(find "$FRONTEND_DIR/.next" -type f 2>/dev/null | wc -l)
        log_success "Frontend build mavjud: $NEXT_SIZE ($NEXT_FILES fayl)"
        
        # BUILD_ID tekshiruvi
        if [ -f "$FRONTEND_DIR/.next/BUILD_ID" ]; then
            BUILD_ID=$(cat "$FRONTEND_DIR/.next/BUILD_ID" 2>/dev/null)
            log_info "Build ID: $BUILD_ID"
        else
            log_warning "BUILD_ID topilmadi"
        fi
    else
        log_error "Frontend build topilmadi: $FRONTEND_DIR/.next"
    fi
    
    # Backend build
    if [ -d "$BACKEND_DIR/dist" ]; then
        BACKEND_SIZE=$(du -sh "$BACKEND_DIR/dist" 2>/dev/null | cut -f1)
        BACKEND_FILES=$(find "$BACKEND_DIR/dist" -type f 2>/dev/null | wc -l)
        log_success "Backend build mavjud: $BACKEND_SIZE ($BACKEND_FILES fayl)"
        
        # main.js tekshiruvi
        if [ -f "$BACKEND_DIR/dist/main.js" ]; then
            log_success "Backend main.js mavjud"
        else
            log_error "Backend main.js topilmadi"
        fi
    else
        log_error "Backend build topilmadi: $BACKEND_DIR/dist"
    fi
    
    # Admin build
    if [ -d "$ADMIN_DIR/dist" ]; then
        ADMIN_SIZE=$(du -sh "$ADMIN_DIR/dist" 2>/dev/null | cut -f1)
        log_success "Admin build mavjud: $ADMIN_SIZE"
    else
        log_warning "Admin build topilmadi (shart emas)"
    fi
}

# 4. Port va process tekshiruvi
check_ports() {
    log_section "4. Port va Process Tekshiruvi"
    
    # Port 3000 (frontend)
    if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
        PROCESS=$(ss -tlnp 2>/dev/null | grep ":3000 " | head -1)
        log_success "Port 3000 ishlatilmoqda: $PROCESS"
    else
        log_warning "Port 3000 bo'sh (frontend ishlamayapti)"
    fi
    
    # Port 3001 (backend)
    if ss -tlnp 2>/dev/null | grep -q ":3001 "; then
        PROCESS=$(ss -tlnp 2>/dev/null | grep ":3001 " | head -1)
        log_success "Port 3001 ishlatilmoqda: $PROCESS"
    else
        log_error "Port 3001 bo'sh (backend ishlamayapti)"
    fi
    
    # Port 3002 (frontend alternative)
    if ss -tlnp 2>/dev/null | grep -q ":3002 "; then
        PROCESS=$(ss -tlnp 2>/dev/null | grep ":3002 " | head -1)
        log_success "Port 3002 ishlatilmoqda: $PROCESS"
    else
        log_warning "Port 3002 bo'sh"
    fi
    
    # PM2 process'lar
    if command -v pm2 &> /dev/null; then
        PM2_COUNT=$(pm2 list 2>/dev/null | grep -c "online" || echo "0")
        if [ "$PM2_COUNT" -gt 0 ]; then
            log_success "PM2 process'lar ishlayapti: $PM2_COUNT"
            pm2 list 2>/dev/null | grep -E "acoustic|frontend|backend" | while read line; do
                log_info "  $line"
            done
        else
            log_warning "PM2 process'lar topilmadi"
        fi
    else
        log_warning "PM2 topilmadi"
    fi
}

# 5. Systemd service tekshiruvi
check_services() {
    log_section "5. Systemd Service Tekshiruvi"
    
    # pm2-acoustic service
    if systemctl list-unit-files 2>/dev/null | grep -q "pm2-acoustic.service"; then
        SERVICE_STATUS=$(systemctl is-active pm2-acoustic 2>/dev/null || echo "unknown")
        if [ "$SERVICE_STATUS" == "active" ]; then
            log_success "pm2-acoustic service ishlayapti"
        else
            log_warning "pm2-acoustic service ishlamayapti: $SERVICE_STATUS"
        fi
        
        # Service enabled
        if systemctl is-enabled pm2-acoustic &>/dev/null; then
            log_success "pm2-acoustic service enabled"
        else
            log_warning "pm2-acoustic service disabled"
        fi
    else
        log_warning "pm2-acoustic service topilmadi"
    fi
    
    # Monitor timer
    if systemctl list-timers 2>/dev/null | grep -q "pm2-acoustic-monitor.timer"; then
        TIMER_STATUS=$(systemctl is-active pm2-acoustic-monitor.timer 2>/dev/null || echo "unknown")
        if [ "$TIMER_STATUS" == "active" ]; then
            log_success "pm2-acoustic-monitor.timer ishlayapti"
        else
            log_warning "pm2-acoustic-monitor.timer ishlamayapti: $TIMER_STATUS"
        fi
    else
        log_warning "pm2-acoustic-monitor.timer topilmadi"
    fi
}

# 6. Nginx tekshiruvi
check_nginx() {
    log_section "6. Nginx Tekshiruvi"
    
    if command -v nginx &> /dev/null; then
        if systemctl is-active --quiet nginx 2>/dev/null; then
            log_success "Nginx ishlayapti"
        else
            log_error "Nginx ishlamayapti"
        fi
        
        # Nginx config test
        if nginx -t &> /dev/null; then
            log_success "Nginx konfiguratsiyasi to'g'ri"
        else
            log_error "Nginx konfiguratsiyasida xatolik"
            nginx -t 2>&1 | head -5 | while read line; do
                log_info "  $line"
            done
        fi
        
        # Acoustic.uz config
        if [ -f "/etc/nginx/sites-enabled/acoustic.uz" ]; then
            log_success "acoustic.uz nginx config mavjud"
        else
            log_warning "acoustic.uz nginx config topilmadi"
        fi
    else
        log_warning "Nginx topilmadi"
    fi
}

# 7. Log fayllar tekshiruvi
check_logs() {
    log_section "7. Log Fayllar Tekshiruvi"
    
    # PM2 loglar
    if [ -f "/var/log/pm2/acoustic-frontend-error.log" ]; then
        ERROR_COUNT=$(tail -100 "/var/log/pm2/acoustic-frontend-error.log" 2>/dev/null | grep -c "error\|Error\|ERROR" || echo "0")
        if [ "$ERROR_COUNT" -gt 0 ]; then
            log_warning "Frontend error log'da $ERROR_COUNT xatolik (oxirgi 100 qator)"
        else
            log_success "Frontend error log toza"
        fi
    else
        log_warning "Frontend error log topilmadi"
    fi
    
    if [ -f "/var/log/pm2/acoustic-backend-error.log" ]; then
        ERROR_COUNT=$(tail -100 "/var/log/pm2/acoustic-backend-error.log" 2>/dev/null | grep -c "error\|Error\|ERROR" || echo "0")
        if [ "$ERROR_COUNT" -gt 0 ]; then
            log_warning "Backend error log'da $ERROR_COUNT xatolik (oxirgi 100 qator)"
        else
            log_success "Backend error log toza"
        fi
    else
        log_warning "Backend error log topilmadi"
    fi
    
    # Monitor log
    if [ -f "/var/log/acoustic-service-monitor.log" ]; then
        LOG_SIZE=$(du -sh "/var/log/acoustic-service-monitor.log" 2>/dev/null | cut -f1)
        log_info "Monitor log hajmi: $LOG_SIZE"
    fi
}

# 8. Fayl permission'lar tekshiruvi
check_permissions() {
    log_section "8. Fayl Permission'lar Tekshiruvi"
    
    # Build fayllar
    if [ -d "$FRONTEND_DIR/.next" ]; then
        if [ -r "$FRONTEND_DIR/.next" ]; then
            log_success "Frontend .next o'qish mumkin"
        else
            log_error "Frontend .next o'qib bo'lmaydi"
        fi
    fi
    
    if [ -d "$BACKEND_DIR/dist" ]; then
        if [ -r "$BACKEND_DIR/dist/main.js" ]; then
            log_success "Backend dist/main.js o'qish mumkin"
        else
            log_error "Backend dist/main.js o'qib bo'lmaydi"
        fi
    fi
}

# 9. Network connectivity tekshiruvi
check_connectivity() {
    log_section "9. Network Connectivity Tekshiruvi"
    
    # Localhost connectivity
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|301\|302"; then
        log_success "Backend localhost:3001 ga ulanish muvaffaqiyatli"
    else
        log_error "Backend localhost:3001 ga ulanish xatolik"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200\|301\|302"; then
        log_success "Frontend localhost:3002 ga ulanish muvaffaqiyatli"
    else
        log_warning "Frontend localhost:3002 ga ulanish xatolik"
    fi
}

# 10. Disk space tekshiruvi
check_disk_space() {
    log_section "10. Disk Space Tekshiruvi"
    
    DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        log_success "Disk space yetarli: $DISK_USAGE% ishlatilgan"
    elif [ "$DISK_USAGE" -lt 90 ]; then
        log_warning "Disk space kamayib qolmoqda: $DISK_USAGE% ishlatilgan"
    else
        log_error "Disk space yetarli emas: $DISK_USAGE% ishlatilgan"
    fi
    
    # Project hajmi
    PROJECT_SIZE=$(du -sh "$PROJECT_DIR" 2>/dev/null | cut -f1)
    log_info "Project hajmi: $PROJECT_SIZE"
}

# Asosiy funksiya
main() {
    log "${BLUE}"
    log "╔══════════════════════════════════════════════════════════════════════════════╗"
    log "║                    ACOUSTIC.UZ TO'LIQ TIZIM TEKSHIRUVI                      ║"
    log "╚══════════════════════════════════════════════════════════════════════════════╝"
    log "${NC}"
    log "Vaqt: $(date '+%Y-%m-%d %H:%M:%S')"
    log "Report fayl: $REPORT_FILE"
    log ""
    
    check_environment
    check_database
    check_builds
    check_ports
    check_services
    check_nginx
    check_logs
    check_permissions
    check_connectivity
    check_disk_space
    
    # Xulosa
    log ""
    log_section "XULOSA"
    log ""
    log "✅ Muvaffaqiyatli: $SUCCESS"
    log "${YELLOW}⚠️  Ogohlantirishlar: $WARNINGS${NC}"
    log "${RED}❌ Xatoliklar: $ERRORS${NC}"
    log ""
    
    if [ "$ERRORS" -eq 0 ]; then
        log "${GREEN}✅ Tizim to'g'ri ishlayapti!${NC}"
    else
        log "${RED}❌ Tizimda $ERRORS ta xatolik topildi!${NC}"
    fi
    
    log ""
    log "Report fayl: $REPORT_FILE"
    log ""
}

main
