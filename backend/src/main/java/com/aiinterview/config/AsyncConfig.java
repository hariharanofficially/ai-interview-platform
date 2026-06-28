package com.aiinterview.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration using Java 21 Virtual Threads (Project Loom).
 *
 * <p>Virtual threads are lightweight, managed by the JVM (not the OS),
 * and can handle millions of concurrent operations — ideal for AI API calls
 * and file processing which are I/O-bound.
 *
 * <p>The {@code @Async} annotation on service methods will use this executor.
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        // Virtual threads via Executors.newVirtualThreadPerTaskExecutor()
        return command -> Thread.ofVirtual()
                .name("async-vt-", 0)
                .start(command);
    }
}
