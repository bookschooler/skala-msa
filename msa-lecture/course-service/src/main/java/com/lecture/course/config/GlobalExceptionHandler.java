package com.lecture.course.config;

import com.lecture.course.dto.CourseDto;
import com.lecture.course.exception.CourseNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(CourseDto.ApiResponse.error(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(CourseDto.ApiResponse.error(message));
    }

    /**
     * 해당 ID의 공고가 없을 때 - 404
     */
    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleCourseNotFound(CourseNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(CourseDto.ApiResponse.error(e.getMessage()));
    }

    /**
     * 지원하지 않는 HTTP 메서드 - 405
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(CourseDto.ApiResponse.error(e.getMessage()));
    }

    /**
     * 지원하지 않는 Content-Type - 415
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(CourseDto.ApiResponse.error(e.getMessage()));
    }

    /**
     * 필수 파라미터 누락 / 파라미터 타입 불일치 - 400
     */
    @ExceptionHandler({
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            MissingRequestHeaderException.class
    })
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleBadRequest(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(CourseDto.ApiResponse.error(e.getMessage()));
    }

    /**
     * 존재하지 않는 경로 요청 - 404
     * 이 핸들러가 없으면 아래 handleGeneral 이 잡아서 500 으로 응답하게 된다.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(CourseDto.ApiResponse.error("요청하신 경로를 찾을 수 없습니다: " + e.getResourcePath()));
    }

    /**
     * Spring 이 상태 코드를 지정해 던지는 예외 (405 Method Not Allowed, 415 등)
     * 원래 상태 코드를 그대로 유지한다.
     */
    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleErrorResponse(ErrorResponseException e) {
        return ResponseEntity.status(e.getStatusCode())
                .body(CourseDto.ApiResponse.error(e.getBody().getDetail()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CourseDto.ApiResponse<Void>> handleGeneral(Exception e) {
        // 스택트레이스를 남겨야 원인 추적이 가능하다
        log.error("처리되지 않은 예외 발생", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(CourseDto.ApiResponse.error("서버 오류가 발생했습니다"));
    }
}
