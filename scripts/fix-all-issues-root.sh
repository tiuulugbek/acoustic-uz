#!/bin/bash

# Barcha muammolarni hal qilish (root user sifatida)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
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

# Root user tekshiruvi
if [ "$EUID" -ne 0 ]; then
    log_error "Bu script root user sifatida ishga tushirilishi kerak!"
    log_info "Ishga tushirish: sudo $0"
    exit 1
fi

# 1. Systemd service'ni o'rnatish
fix_systemd_service() {
    log_section "1. Systemd Service'ni O'rnatish"
    
    # Service fayllarini ko'chirish
    if [ -f "$DEPLOY_DIR/pm2-acoustic.service" ]; then
        log_info "Service faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic.service" /etc/systemd/system/
        log_success "Service fayl ko'chirildi"
    else
        log_error "Service fayl topilmadi"
        return 1
    fi
    
    # Monitor service va timer
    if [ -f "$DEPLOY_DIR/pm2-acoustic-monitor.service" ]; then
        log_info "Monitor service faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic-monitor.service" /etc/systemd/system/
        log_success "Monitor service fayl ko'chirildi"
    fi
    
    if [ -f "$DEPLOY_DIR/pm2-acoustic-monitor.timer" ]; then
        log_info "Monitor timer faylini ko'chirish..."
        cp "$DEPLOY_DIR/pm2-acoustic-monitor.timer" /etc/systemd/system/
        log_success "Monitor timer fayl ko'chirildi"
    fi
    
    # Systemd'ni qayta yuklash
    log_info "Systemd'ni qayta yuklash..."
    systemctl daemon-reload
    log_success "Systemd qayta yuklandi"
    
    # Service'ni enable qilish
    log_info "Service'ni enable qilish..."
    systemctl enable pm2-acoustic
    log_success "Service enabled"
    
    # Monitor timer'ni enable qilish
    log_info "Monitor timer'ni enable qilish..."
    systemctl enable pm2-acoustic-monitor.timer
    log_success "Monitor timer enabled"
    
    # Service'ni ishga tushirish
    log_info "Service'ni ishga tushirish..."
    systemctl start pm2-acoustic
    sleep 2
    if systemctl is-active --quiet pm2-acoustic; then
        log_success "Service ishga tushirildi"
    else
        log_warning "Service ishga tushirish xatolik"
        systemctl status pm2-acoustic --no-pager -l | head -10
    fi
    
    # Monitor timer'ni ishga tushirish
    log_info "Monitor timer'ni ishga tushirish..."
    systemctl start pm2-acoustic-monitor.timer
    if systemctl is-active --quiet pm2-acoustic-monitor.timer; then
        log_success "Monitor timer ishga tushirildi"
    else
        log_warning "Monitor timer ishga tushirish xatolik"
    fi
}

# 2. Nginx'ni ishga tushirish
fix_nginx() {
    log_section "2. Nginx'ni Ishga Tushirish"
    
    # Nginx config test
    if nginx -t &>/dev/null; then
        log_success "Nginx konfiguratsiyasi to'g'ri"
        
        # Nginx'ni ishga tushirish
        if systemctl is-active --quiet nginx; then
            log_success "Nginx allaqachon ishlayapti"
        else
            log_info "Nginx'ni ishga tushirish..."
            systemctl start nginx
            sleep 2
            if systemctl is-active --quiet nginx; then
                log_success "Nginx ishga tushirildi"
            else
                log_error "Nginx ishga tushirish xatolik"
                systemctl status nginx --no-pager -l | head -10
            fi
        fi
    else
        log_error "Nginx konfiguratsiyasida xatolik"
        nginx -t
    fi
}

# 3. PM2 process'larini ishga tushirish (acoustic user sifatida)
fix_pm2() {
    log_section "3. PM2 Process'larini Ishga Tushirish"
    
    # Acoustic user sifatida PM2'ni ishga tushirish
    if [ -f "/var/www/acoustic.uz/deploy/ecosystem.config.js" ]; then
        log_info "PM2 process'larini ishga tushirish (acoustic user sifatida)..."
        
        # Acoustic user sifatida PM2'ni ishga tushirish
        su - acoustic -c "cd /var/www/acoustic.uz && pm2 start deploy/ecosystem.config.js" 2>&1 || {
            log_warning "PM2 ishga tushirish xatolik (acoustic user sifatida)"
            log_info "Qo'lda ishga tushirish kerak:"
            log "  su - acoustic"
            log "  cd /var/www/acoustic.uz"
            log "  pm2 start deploy/ecosystem.config.js"
        }
        
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
        log_error "Ecosystem config topilmadi"
    fi
}

# 4. Xulosa
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
    if systemctl is-active --quiet nginx; then
        log_success "Nginx ishlayapti"
    else
        log_warning "Nginx ishlamayapti"
    fi
    
    # Systemd service
    if systemctl is-active --quiet pm2-acoustic; then
        log_success "Systemd service ishlayapti"
    else
        log_warning "Systemd service ishlamayapti"
    fi
    
    log ""
}

# Asosiy funksiya
main() {
    log "${BLUE}"
    log "╔══════════════════════════════════════════════════════════════════════════════╗"
    log "║        BARCHA MUAMMOLARNI HAL QILISH (ROOT USER SIFATIDA)                   ║"
    log "╚══════════════════════════════════════════════════════════════════════════════╝"
    log "${NC}"
    log "Vaqt: $(date '+%Y-%m-%d %H:%M:%S')"
    log ""
    
    fix_systemd_service
    fix_nginx
    fix_pm2
    show_summary
    
    log ""
    log_success "Barcha muammolar hal qilindi!"
    log ""
}

main
