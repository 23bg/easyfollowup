import { leadRepository } from "@/features/lead/repositories/lead.repo";

type DedupInput = {
    instituteId: string;
    phone?: string;
    email?: string;
    name: string;
    city?: string;
};

export const dedupService = {
    async findDuplicate(input: DedupInput) {
        if (input.phone) {
            const byPhone = await leadRepository.findByPhoneInInstitute(input.instituteId, input.phone);
            if (byPhone) return byPhone;
        }

        if (input.email) {
            const byEmail = await leadRepository.findByEmailInInstitute(input.instituteId, input.email);
            if (byEmail) return byEmail;
        }

        if (input.city) {
            const byNameCity = await leadRepository.findByNameAndCityInInstitute(input.instituteId, input.name, input.city);
            if (byNameCity) return byNameCity;
        }

        return null;
    },
};
