package com.quadra.ecommerce_api.config.document;


import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
//@SecurityScheme(
//        name = "bearerAuth",
//        type = SecuritySchemeType.HTTP,
//        scheme = "bearer",
//        bearerFormat = "JWT"
//)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("QUADRA E-Commerce API")
                        .version("1.0.0")
                        .description("Tài liệu RESTful API cho hệ thống bán hàng QUADRA")
                        .contact(new Contact().name("Dev Team").email("support@quadra.vn"))
                        .license(new License().name("Apache 2.0").url("http://springdoc.org"))
                );
    }
}

