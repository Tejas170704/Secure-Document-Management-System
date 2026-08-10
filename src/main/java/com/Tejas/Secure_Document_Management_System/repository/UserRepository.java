package com.Tejas.Secure_Document_Management_System.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.Tejas.Secure_Document_Management_System.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    @Override
    Page<User> findAll(Pageable pageable);
    boolean existsByEmail(String email);
    @Override
    long count();
}