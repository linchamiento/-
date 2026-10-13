package com.shengxu.config;
import com.shengxu.dto.ApiResponse; import com.shengxu.utils.BusinessException;
import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(BusinessException.class) ResponseEntity<ApiResponse<Void>> business(BusinessException e){return ResponseEntity.status(e.status()).body(ApiResponse.fail(e.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException e){String m=e.getBindingResult().getFieldErrors().stream().findFirst().map(x->x.getField()+" "+x.getDefaultMessage()).orElse("参数不正确"); return ResponseEntity.badRequest().body(ApiResponse.fail(m));}
 @ExceptionHandler(Exception.class) ResponseEntity<ApiResponse<Void>> unknown(Exception e){return ResponseEntity.status(500).body(ApiResponse.fail("服务暂时不可用，请稍后重试"));}
}
