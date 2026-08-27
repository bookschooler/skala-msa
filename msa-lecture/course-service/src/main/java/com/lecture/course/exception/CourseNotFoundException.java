package com.lecture.course.exception;

/**
 * 해당 ID의 분양 공고가 없을 때 발생 - HTTP 404 로 응답된다.
 * IllegalArgumentException(400) 과 구분하기 위해 별도 예외로 분리했다.
 */
public class CourseNotFoundException extends RuntimeException {

    public CourseNotFoundException(Long id) {
        super("강의를 찾을 수 없습니다: " + id);
    }
}
