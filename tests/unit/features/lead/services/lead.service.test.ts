import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";

const { mockLeadRepo, mockStudentRepo, mockInstituteRepo } = vi.hoisted(() => ({
    mockLeadRepo: {
        create: vi.fn(),
        updateStatus: vi.fn(),
        findByIdInInstitute: vi.fn(),
        updateByIdInInstitute: vi.fn(),
        list: vi.fn(),
    },
    mockStudentRepo: {
        findByPhoneInInstitute: vi.fn(),
        create: vi.fn(),
    },
    mockInstituteRepo: {
        findBySlug: vi.fn(),
    },
}));

vi.mock("@/features/lead/repositories/lead.repo", () => ({
    leadRepository: mockLeadRepo,
}));

vi.mock("@/features/student/repositories/student.repo", () => ({
    studentRepository: mockStudentRepo,
}));

vi.mock("@/features/institute/repositories/institute.repo", () => ({
    instituteRepository: mockInstituteRepo,
}));

import { leadService } from "@/features/lead/services/lead.service";

describe("leadService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates lead with NEW status", async () => {
        mockLeadRepo.create.mockResolvedValue({ id: "l1" });
        await leadService.createLead({
            instituteId: "inst1",
            name: "Rahul",
            phone: "9876543210",
            email: "r@test.com",
        });
        expect(mockLeadRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: "NEW" }));
    });

    it("throws for missing institute in create by slug", async () => {
        mockInstituteRepo.findBySlug.mockResolvedValue(null);
        await expect(
            leadService.createLeadBySlug("bad-slug", { name: "N", phone: "9876543210" })
        ).rejects.toThrow(AppError);
    });

    it("updates lead status and creates student on ADMITTED", async () => {
        mockLeadRepo.findByIdInInstitute.mockResolvedValue({
            id: "l1",
            name: "Lead",
            phone: "9876543210",
            email: "lead@test.com",
        });
        mockStudentRepo.findByPhoneInInstitute.mockResolvedValue(null);
        const result = await leadService.updateStatus("inst1", "l1", "ADMITTED");
        expect(mockLeadRepo.updateStatus).toHaveBeenCalled();
        expect(mockStudentRepo.create).toHaveBeenCalled();
        expect(result.id).toBe("l1");
    });

    it("throws duplicate student error on admitted status", async () => {
        mockLeadRepo.findByIdInInstitute.mockResolvedValue({
            id: "l1",
            name: "Lead",
            phone: "9876543210",
            email: "lead@test.com",
        });
        mockStudentRepo.findByPhoneInInstitute.mockResolvedValue({ id: "s1" });

        await expect(leadService.updateStatus("inst1", "l1", "ADMITTED")).rejects.toThrow(AppError);
    });

    it("throws when nothing to update", async () => {
        await expect(leadService.updateLead("inst1", "l1", {})).rejects.toThrow(AppError);
    });

    it("updates notes and follow-up fields", async () => {
        mockLeadRepo.findByIdInInstitute.mockResolvedValue({ id: "l1" });
        await leadService.updateLead("inst1", "l1", { message: "called", followUpAt: "2026-02-27" });
        expect(mockLeadRepo.updateByIdInInstitute).toHaveBeenCalled();
    });

    it("delegates getLeads filters parsing", async () => {
        mockLeadRepo.list.mockResolvedValue([{ id: "l1" }]);
        const result = await leadService.getLeads("inst1", { query: "rahul" });
        expect(mockLeadRepo.list).toHaveBeenCalledWith(expect.objectContaining({ instituteId: "inst1", query: "rahul" }));
        expect(result).toHaveLength(1);
    });

    it("exports leads with expected shape", async () => {
        mockLeadRepo.list.mockResolvedValue([
            {
                id: "l1",
                name: "A",
                phone: "9876543210",
                email: null,
                status: "NEW",
                source: null,
                createdAt: new Date("2026-02-27T00:00:00.000Z"),
            },
        ]);

        const result = await leadService.exportLeads("inst1");
        expect(result[0]).toMatchObject({
            id: "l1",
            email: "",
            source: "",
            status: "NEW",
        });
    });
});
