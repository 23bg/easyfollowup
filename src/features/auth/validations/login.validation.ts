import { z } from "zod";

// âœ… Schema for validation
export const loginFormSchema = z.object({
    email: z.string().email("Enter a valid email"),
});

export type loginFormData = z.infer<typeof loginFormSchema>;
