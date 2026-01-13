export let apps: {
    name: string;
    script: string;
    cwd: string;
    instances: number;
    exec_mode: string;
    env: {
        NODE_ENV: string;
        PORT: number;
    };
    error_file: string;
    out_file: string;
    log_date_format: string;
    merge_logs: boolean;
    autorestart: boolean;
    max_memory_restart: string;
    watch: boolean;
}[];
//# sourceMappingURL=ecosystem.config.d.ts.map