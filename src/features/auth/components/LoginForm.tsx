// "use client";

// import { useAuth } from "../hooks/useAuth";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { loginFormSchema } from "../validations/login.validation";
// import { LoginFormData } from "@/features/instagram/validations/login.validation";
// import ROUTES from "@/constants/route";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// import { Label } from "recharts";
// import Link from "next/link";




// export default function LoginForm() {
//     const router = useRouter();
//     const { login, loading, error } = useAuth();

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//     } = useForm<LoginFormData>({
//         resolver: zodResolver(loginFormSchema),
//     });

//     const onSubmit = async (data: LoginFormData) => {
//         try {
//             const success = await login(data);

//             if (success) {
//                 // Save email to localStorage
//                 localStorage.setItem("login_email", data.email);
//                 router.push(ROUTES.AUTH.VERIFICATION);
//             }

//             reset();
//         } catch (err) {
//             console.error("âŒ Login failed:", err);
//         }
//     };

//     return (

//         <Card className="border-0 shadow-lg">
//             <CardHeader className="space-y-1">
//                 <CardTitle className="text-2xl">Sign in</CardTitle>
//                 <CardDescription>Enter your email below to sign in to your account</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                     <div className="space-y-2">
//                         <Label >Email</Label>

//                         {/* <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} /> */}
//                         <Input
//                             type="email"
//                             {...register("email")}
//                             placeholder="Email"
//                             className="border rounded px-3 py-2 w-full"
//                             disabled={loading}
//                         />
//                         {errors.email && (
//                             <p className="text-red-500 text-sm">{errors.email.message}</p>
//                         )}
//                     </div>

//                     <Button type="submit" className="w-full" disabled={loading}>
//                         {loading ? "Signing in..." : "Sign in"}
//                     </Button>



//                     <p className="text-center text-sm text-muted-foreground">
//                         Don't have an account?{" "}
//                         <Link href={ROUTES.AUTH.SIGN_UP} className="text-primary hover:underline font-medium">
//                             Sign up
//                         </Link>
//                     </p>
//                 </form>
//             </CardContent>
//         </Card>

//     );
// }



"use client";

import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "../validations/login.validation";
import { loginFormData } from "../validations/login.validation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { toast } from "sonner";

export default function LoginForm() {
    const router = useRouter();
    const { login, loading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<loginFormData>({
        resolver: zodResolver(loginFormSchema),
    });

    const onSubmit = async (data: loginFormData) => {
        login(
            { email: data.email },

            {
                onSuccess: () => {
                    // Save email temporarily for OTP verification
                    localStorage.setItem("login_email", data.email);

                    toast.success("Login successful. OTP sent!");
                    router.push(ROUTES.AUTH.VERIFICATION);
                    reset();
                },

                onError: (err: any) => {
                    toast.error(typeof err === 'string' ? err : err?.message || "Login failed");
                },
            }
        );
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription>
                    Enter your email below to continue
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label>Email</label>
                        <Input
                            type="email"
                            {...register("email")}
                            placeholder="name@example.com"
                            disabled={loading}
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href={ROUTES.AUTH.SIGN_UP}
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}

