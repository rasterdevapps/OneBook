package com.nexus.onebook.ledger.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.stereotype.Component;

/**
 * JPA {@link AttributeConverter} that transparently encrypts field values
 * on write and decrypts on read using AES-256-GCM.
 * <p>
 * Apply to any entity column that must be stored encrypted at rest:
 * <pre>
 *   &#064;Convert(converter = EncryptedStringConverter.class)
 *   private String accountName;
 * </pre>
 */
@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static FieldEncryptionService encryptionService;

    /**
     * Spring injects the {@link FieldEncryptionService} via this setter because
     * JPA converters are not managed beans by default.
     */
    public EncryptedStringConverter(FieldEncryptionService fieldEncryptionService) {
        EncryptedStringConverter.encryptionService = fieldEncryptionService;
    }

    /** No-arg constructor required by JPA. */
    public EncryptedStringConverter() {}

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (encryptionService == null || attribute == null) {
            return attribute;
        }
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (encryptionService == null || dbData == null) {
            return dbData;
        }
        return encryptionService.decrypt(dbData);
    }
}
