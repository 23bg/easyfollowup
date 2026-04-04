import z from "zod";

export const signupFormSchema = z.object({
    name: z.string().min(2, "Name too short"),
    phoneNumber: z.string().min(2, "Name too short"),
    email: z.string().email(),
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
