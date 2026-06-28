package com.aiinterview.module.resume.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@Slf4j
public class DocumentParsingService {

    /**
     * Parses an input stream (PDF, Word, etc.) into raw text using Apache Tika.
     *
     * @param inputStream The stream of the file to parse.
     * @return The extracted text.
     */
    public String parseDocument(InputStream inputStream) {
        log.info("Starting document parsing with Apache Tika...");
        try {
            // Limits the output text size to avoid memory issues (set to -1 for unlimited)
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            AutoDetectParser parser = new AutoDetectParser();
            ParseContext context = new ParseContext();

            parser.parse(inputStream, handler, metadata, context);
            
            String rawText = handler.toString();
            log.info("Successfully parsed document. Extracted {} characters.", rawText.length());
            
            return rawText;
        } catch (Exception e) {
            log.error("Failed to parse document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to parse document", e);
        }
    }
}
