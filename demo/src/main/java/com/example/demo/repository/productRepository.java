package com.example.demo.repository;

import com.example.demo.model.product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface productRepository extends JpaRepository<product, Long> {
}