package com.example.dev.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@EnableWebMvc
@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class JWTConfig {
    private final JWTFilter jwtFilter;
    private static final String[] PUBLIC_URL = {
            "/api/cart/**",
            "/admin/phieu-giam-gia/hien-thi-voucher", // <== Thêm dòng này vào
            "/admin/mau-sac/hien-thi",
            "/admin/kich-co/hien-thi",
            "/admin/san-pham/hien-thi/online/**",
            "/hinh-anh/**",
            "/admin/chi-tiet-san-pham/hien-thi/online/**",
            "/admin/chi-tiet-san-pham/dot-giam/hien-thi/**",
            "/admin/hoa-don/thanh-toan-cod",
            "/admin/hoa-don/thanh-toan-vnpay",
            "/admin/hoa-don/vnpay-return",
            "/admin/khach-hang/detail-client/**",
            "/auth/**",
            "/api/payment/**",
            "/admin/dia-chi/**",
            "/admin/khach-hang/update-address-selected",
            "/admin/khach-hang/update-address-direct",
            "/admin/khach-hang/them-dia-chi",
            "/admin/hoa-don/hien-thi-hoa-don",
            "/admin/hoa-don/payment-status",
            "/ws/**"
    };


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Chỉ định domain cụ thể
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorizeRequests ->
                    authorizeRequests
                            .requestMatchers(PUBLIC_URL).permitAll()
                            .requestMatchers("/admin/**").hasAnyAuthority("ADMIN", "STAFF","CUSTOMER")
                            .anyRequest().authenticated()
                )
//                .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(handing -> handing.authenticationEntryPoint(((request, response, authException) -> response
                        .sendError(HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED: " + authException.getMessage()))))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
