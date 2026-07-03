package com.example.tournament.dto.response;

import com.example.tournament.enums.UserRole;
import lombok.Data;

@Data
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private UserRole role;
}
