import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";

export default function TeamPage() {
    return (
        <Container className="py-4 md:py-6 lg:py-8">
            <PageHeader
                title="Team"
                description="Manage organization members with OWNER, EDITOR, and VIEWER access."
            />
        </Container>
    );
}
