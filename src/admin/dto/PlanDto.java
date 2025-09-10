package com.dodam.admin.dto;

import com.dodam.plan.Entity.PlanBenefitEntity;
import com.dodam.plan.Entity.PlanPriceEntity;
import com.dodam.plan.Entity.PlansEntity;
import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PlanDto {

    // --- Inner DTO for Price ---
    @Getter @Setter @NoArgsConstructor
    public static class PriceInfo {
        @NotNull
        private Integer termMonth;
        @NotBlank
        private String billMode;
        @NotNull
        private BigDecimal amount;
        @NotBlank @Size(min = 3, max = 3)
        private String currency;
    }

    // --- Inner DTO for Benefit ---
    @Getter @Setter @NoArgsConstructor
    public static class BenefitInfo {
        @NotBlank
        private String note;
        private BigDecimal priceCap;
    }

    // --- Request DTOs ---
    @Getter @Setter
    public static class CreateRequest {
        @NotBlank
        private String planCode;
        @NotBlank
        private String planName;
        private List<PriceInfo> prices;
        private List<BenefitInfo> benefits;
    }

    // ✅ [수정된 부분] UpdateRequest가 prices와 benefits를 포함하도록 변경
    @Getter @Setter
    public static class UpdateRequest {
        @NotBlank
        private String planName;
        @NotNull
        private Boolean planActive;
        private List<PriceInfo> prices;
        private List<BenefitInfo> benefits;
    }

    // --- Response DTO ---
    @Getter @Builder @AllArgsConstructor
    public static class PlanResponse {
        private Long planId;
        private String planCode;
        private String planName;
        private Boolean planActive;
        private LocalDateTime planCreate;
        private List<PriceInfo> prices;
        private List<BenefitInfo> benefits;

        public static PlanResponse fromEntity(PlansEntity plan, List<PlanPriceEntity> prices, List<PlanBenefitEntity> benefits) {
            return PlanResponse.builder()
                .planId(plan.getPlanId())
                .planCode(plan.getPlanCode())
                .planName(plan.getPlanName().getPlanName())
                .planActive(plan.getPlanActive())
                .planCreate(plan.getPlanCreate())
                .prices(prices.stream().map(p -> {
                    PriceInfo dto = new PriceInfo();
                    dto.setTermMonth(p.getPterm().getPtermMonth());
                    dto.setBillMode(p.getPpriceBilMode());
                    dto.setAmount(p.getPpriceAmount());
                    dto.setCurrency(p.getPpriceCurr());
                    return dto;
                }).collect(Collectors.toList()))
                .benefits(benefits.stream().map(b -> {
                    BenefitInfo dto = new BenefitInfo();
                    dto.setNote(b.getPbNote());
                    dto.setPriceCap(b.getPbPriceCap());
                    return dto;
                }).collect(Collectors.toList()))
                .build();
        }
    }
}

