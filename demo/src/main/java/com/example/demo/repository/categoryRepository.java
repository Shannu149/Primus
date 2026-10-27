package com.example.demo.repository;

import com.example.demo.model.category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface categoryRepository extends JpaRepository<category, Long> {
}