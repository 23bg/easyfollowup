import AuthLayout from '@/components/layout/AuthLayout'
import React from 'react'

export default async function Layout({ children }: { children: React.ReactNode }) {
    return <AuthLayout>{children}</AuthLayout>
}


