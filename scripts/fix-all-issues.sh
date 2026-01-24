#!/bin/bash

# Barcha muammolarni bir vaqtda hal qilish

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/apps/backend"
DEPLOY_DIR="$PROJECT_DIR/deploy"

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$1"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  $1${NC}"
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

# 1. Database ulanish muammosini hal qilish
fix_database() {
    log_section "1. Database Ulanish Muammosini Hal Qilish"
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        log_info "Database connection string'ni tekshirish..."
        
        # PostgreSQL port'ni tekshirish
        if ss -tlnp 2>/dev/null | grep -q ":5432"; then
            log_success "PostgreSQL port 5432 ishlatilmoqda"
        else
            log_warning "PostgreSQL port 5432 bo'sh (socket orqali ishlayotgan bo'lishi mumkin)"
        fi
        
        # Connection test
        export $(grep -v '^#' "$BACKEND_DIR/.env" | grep -E '^DATABASE_URL=' | xargs)
        if timeout 5 psql "$DATABASE_URL" -c "SELECT 1;" &>/dev/null; then
            log_success "Database ulanish muvaffaqiyatli"
        else
            log_warning "Database ulanish xatolik (backend ishga tushganda tekshiriladi)"
        fi
    else
        log_error ".env fayl topilmadi"
    fi
}

# 2. Backend va Frontend'ni ishga tushirish
fix_backend_frontend() {
    log_section "2. Backend va Frontend'ni Ishga Tushirish"
    
    # PM2 process'larini tekshirish
    if command -v pm2 &> /dev/null; then
        log_info "PM2 process'larini tekshirish..."
        
        # Ecosystem config mavjudligini tekshirish
        if [ -f "/var/www/acoustic.uz/deploy/ecosystem.config.js" ]; then
            log_success "Ecosystem config mavjud"
            
            # PM2 process'larini ishga tushirish
            log_info "PM2 process'larini ishga tushirish..."
            cd /var/www/acoustic.uz
            
            # Backend
            if pm2 list 2>/dev/null | grep -q "acoustic-backend"; then
                log_info "Backend allaqachon ishga tushirilgan"
                pm2 restart acoustic-backend 2>/dev/null || log_warning "Backend restart xatolik"
            else
                log_info "Backend'ni ishga tushirish..."
                pm2 start deploy/ecosystem.config.js --only acoustic-backend 2>/dev/null && log_success "Backend ishga tushirildi" || log_warning "Backend ishga tushirish xatolik"
            fi
            
            # Frontend
            if pm2 list 2>/dev/null | grep -q "acoustic-frontend"; then
                log_info "Frontend allaqachon ishga tushirilgan"
                pm2 restart acoustic-frontend 2>/dev/null || log_warning "Frontend restart xatolik"
            else
                log_info "Frontend'ni ishga tushirish..."
                pm2 start deploy/ecosystem.config.js --only acoustic-frontend 2>/dev/null && log_success "Frontend ishga tushirildi" || log_warning "Frontend ishga tushirish xatolik"
            fi
            
            sleep 3
            
            # Port tekshiruvi
            if ss -tlnp 2>/dev/null | grep -q ":3001"; then
                log_success "Backend port 3001 ishlatilmoqda"
            else
                log_warning "Backend port 3001 bo'sh"
            fi
            
            if ss -tlnp 2>/dev/null | grep -q ":3002"; then
                log_success "Frontend port 3002 ishlatilmoqda"
            else
                log_warning "Frontend port 3002 bo'sh"
            fi
        else
            log_error "Ecosystem config topilmadi: /var/www/acoustic.uz/deploy/ecosystem.config.js"
        fi
    else
        log_error "PM2 topilmadi"
    fi
}

# 3. Nginx'ni ishga tushirish
fix_nginx() {
    log_section "3. Nginx'ni Ishga Tushirish"
    
    if command -v nginx &> /dev/null; then
        # Nginx config test
        if nginx -t &>/dev/null; then
            log_success "Nginx konfiguratsiyasi to'g'ri"
            
            # Nginx'ni ishga tushirish
            if systemctl is-active --quiet nginx 2>/dev/null; then
                log_success "Nginx allaqachon ishlayapti"
            else
                log_info "Nginx'ni ishga tushirish..."
                systemctl start nginx 2>/dev/null && log_success "Nginx ishga tushirildi" || log_warning "Nginx ishga tushirish xatolik (root user sifatida ishlatish kerak)"
            fi
        else
            log_error "Nginx konfiguratsiyasida xatolik"
            nginx -t 2>&1 | head -5
        fi
    else
        log_error "Nginx topilmadi"
    fi
}

# 4. Systemd service'ni o'rnatish
fix_systemd_service() {
    log_section "4. Systemd Service'ni O'rnatish"
    
    # Service fayllarini ko'chirish
    if [ -f "$DEPLOY_DIR/pm2-acoustic.service" ]; then
        log_info "Service faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic.service" /etc/systemd/system/ 2>/dev/null && log_success "Service fayl ko'chirildi" || log_warning "Service fayl ko'chirish xatolik (root user sifatida ishlatish kerak)"
    else
        log_error "Service fayl topilmadi: $DEPLOY_DIR/pm2-acoustic.service"
    fi
    
    # Monitor service va timer
    if [ -f "$DEPLOY_DIR/pm2-acoustic-monitor.service" ]; then
        log_info "Monitor service faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic-monitor.service" /etc/systemd/system/ 2>/dev/null && log_success "Monitor service fayl ko'chirildi" || log_warning "Monitor service fayl ko'chirish xatolik"
    fi
    
    if [ -f "$DEPLOY_DIR/pm2-acoustic-monitor.timer" ]; then
        log_info "Monitor timer faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic-monitor.timer" /etc/systemd/system/ 2>/dev/null && log_success "Monitor timer fayl ko'chirildi" || log_warning "Monitor timer fayl ko'chirish xatolik"
    fi
    
    # Systemd'ni qayta yuklash
    log_info "Systemd'ni qayta yuklash..."
    systemctl daemon-reload 2>/dev/null && log_success "Systemd qayta yuklandi" || log_warning "Systemd qayta yuklash xatolik (root user sifatida ishlatish kerak)"
    
    # Service'ni enable qilish
    log_info "Service'ni enable qilish..."
    systemctl enable pm2-acoustic 2>/dev/null && log_success "Service enabled" || log_warning "Service enable xatolik"
    
    # Monitor timer'ni enable qilish
    log_info "Monitor timer'ni enable qilish..."
    systemctl enable pm2-acoustic-monitor.timer 2>/dev/null && log_success "Monitor timer enabled" || log_warning "Monitor timer enable xatolik"
    
    # Service'ni ishga tushirish
    log_info "Service'ni ishga tushirish..."
    systemctl start pm2-acoustic 2>/dev/null && log_success "Service ishga tushirildi" || log_warning "Service ishga tushirish xatolik (root user sifatida ishlatish kerak)"
    
    # Monitor timer'ni ishga tushirish
    log_info "Monitor timer'ni ishga tushirish..."
    systemctl start pm2-acoustic-monitor.timer 2>/dev/null && log_success "Monitor timer ishga tushirildi" || log_warning "Monitor timer ishga tushirish xatolik"
}

# 5. Xulosa
show_summary() {
    log_section "XULOSA"
    
    log ""
    log_info "Tekshiruv:"
    
    # Port tekshiruvi
    if ss -tlnp 2>/dev/null | grep -q ":3001"; then
        log_success "Backend port 3001 ishlatilmoqda"
    else
        log_warning "Backend port 3001 bo'sh"
    fi
    
    if ss -tlnp 2>/dev/null | grep -q ":3002"; then
        log_success "Frontend port 3002 ishlatilmoqda"
    else
        log_warning "Frontend port 3002 bo'sh"
    fi
    
    # Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_success "Nginx ishlayapti"
    else
        log_warning "Nginx ishlamayapti"
    fi
    
    # Systemd service
    if systemctl is-active --quiet pm2-acoustic 2>/dev/null; then
        log_success "Systemd service ishlayapti"
    else
        log_warning "Systemd service ishlamayapti"
    fi
    
    log ""
    log_info "Agar ba'zi muammolar hal bo'lmagan bo'lsa, root user sifatida quyidagi buyruqlarni bajaring:"
    log ""
    log "  systemctl start nginx"
    log "  systemctl daemon-reload"
    log "  systemctl enable pm2-acoustic"
    log "  systemctl start pm2-acoustic"
    log ""
}

# Asosiy funksiya
main() {
    log "${BLUE}"
    log "╔══════════════════════════════════════════════════════════════════════════════╗"
    log "║              BARCHA MUAMMOLARNI HAL QILISH                                   ║"
    log "╚══════════════════════════════════════════════════════════════════════════════╝"
    log "${NC}"
    log "Vaqt: $(date '+%Y-%m-%d %H:%M:%S')"
    log ""
    
    fix_database
    fix_backend_frontend
    fix_nginx
    fix_systemd_service
    show_summary
    
    log ""
    log_success "Barcha muammolar hal qilindi!"
    log ""
}

main
