package com.example.dev.constant;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class VnPayConstant {
    @Getter
    @AllArgsConstructor
    public enum VnPayConstantEnum {
        PAY("pay"),QUERYDR("querydr"),REFUND("refund");
        private final String value;
    }
}
