package com.nexus.onebook.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Headless API configuration for Milestone 7.
 * <p>
 * Ensures the REST API is fully decoupled from any specific frontend framework,
 * enabling seamless consumption by Angular, Flutter, React Native, or any HTTP client.
 * <ul>
 *   <li>Content negotiation defaults to JSON</li>
 *   <li>CORS is configured for cross-origin mobile/web access</li>
 *   <li>No server-side rendering or HTML template dependencies</li>
 * </ul>
 */
@Configuration
public class HeadlessApiConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .defaultContentType(MediaType.APPLICATION_JSON)
                .favorParameter(false)
                .ignoreAcceptHeader(false)
                .mediaType("json", MediaType.APPLICATION_JSON);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
