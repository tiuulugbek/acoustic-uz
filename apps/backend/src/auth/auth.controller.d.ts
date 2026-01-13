import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string | null;
            role: string;
            mustChangePassword: boolean;
        };
        access_token: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        access_token: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    getMe(user: unknown): Promise<unknown>;
    changePassword(user: {
        id: string;
    }, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map