import { z } from 'zod';
import { loginSchema, changePasswordSchema } from '@acoustic/shared';

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

