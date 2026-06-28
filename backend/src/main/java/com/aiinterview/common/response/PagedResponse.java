package com.aiinterview.common.response;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Pagination-aware API response for list endpoints.
 *
 * <p>Wraps Spring Data's Page object and exposes pagination metadata
 * in a frontend-friendly format.
 *
 * @param <T> the element type of the content list
 */
@Getter
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;
    private final boolean empty;

    public PagedResponse(Page<T> page) {
        this.content       = page.getContent();
        this.page          = page.getNumber();
        this.size          = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages    = page.getTotalPages();
        this.first         = page.isFirst();
        this.last          = page.isLast();
        this.empty         = page.isEmpty();
    }

    public static <T> ApiResponse<PagedResponse<T>> of(Page<T> page) {
        return ApiResponse.success(new PagedResponse<>(page));
    }
}
