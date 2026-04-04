// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useAuth } from "../hooks/useAuth";
// import {
//     SignupFormData,
//     signupFormSchema,
// } from "../validations/signup.validation";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import ROUTES from "@/constants/route";
// import loading from "@/app/loading";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { error } from "console";
// import { register } from "module";
// import { Label } from "recharts";
// import Link from "next/link";

// export default function SignupForm() {
//     const router = useRouter();
//     const { signup, loading, error } = useAuth();

//     const {
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//     } = useForm<SignupFormData>({
//         resolver: zodResolver(signupFormSchema),
//     });

//     const onSubmit = async (data: SignupFormData) => {
//         const success = await signup(data);

//         if (success.type === "success") {
//             router.push(ROUTES.AUTH.VERIFICATION); // Where user receives OTP next
//         }

//         reset();
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
//                         <Label >Name</Label>

//                         {/* <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} /> */}
//                         <Input
//                             {...register("name")}
//                             placeholder="Full Name"

//                             className="border rounded px-3 py-2 w-full"
//                         />
//                         {errors.name && (
//                             <p className="text-red-500 text-sm">{errors.name.message}</p>
//                         )}

//                     </div>
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
//                     <div className="space-y-2">
//                         <Label >Phone Number</Label>

//                         {/* <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={loading} /> */}
//                         <Input
//                             type="text"
//                             {...register("phoneNumber")}
//                             placeholder="Phone Number"
//                             className="border rounded px-3 py-2 w-full"
//                             disabled={loading}
//                         />
//                         {errors.phoneNumber && (
//                             <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
//                         )}
//                     </div>


//                     {/* Error Message */}
//                     {error && <p className="text-red-500 text-sm">{error}</p>}


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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";

import {
    SignupFormData,
    signupFormSchema,
} from "../validations/signup.validation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

import Link from "next/link";
import { toast } from "sonner";

export default function SignupForm() {
    const router = useRouter();
    const { signup, loading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupFormSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        signup(
            data,
            {
                onSuccess: () => {
                    // Save email for OTP verification
                    localStorage.setItem("login_email", data.email);

                    toast.success("Signup successful! OTP sent.");
                    router.push(ROUTES.AUTH.VERIFICATION);

                    reset();
                },

                onError: (err: any) => {
                    toast.info(typeof err === 'string' ? err : err?.message || "Signup failed");
                }
            }
        );
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                    Enter your details to continue
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Name */}
                    <div className="space-y-2">
                        <label>Name</label>
                        <Input
                            {...register("name")}
                            placeholder="Full Name"
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label>Email</label>
                        <Input
                            type="email"
                            {...register("email")}
                            placeholder="Email"
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label>Phone Number</label>
                        <Input
                            type="text"
                            {...register("phoneNumber")}
                            placeholder="Phone Number"
                            disabled={loading}
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm">
                                {errors.phoneNumber.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Sign up"}
                    </Button>

                    {/* Redirect */}
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href={ROUTES.AUTH.LOG_IN}
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}

