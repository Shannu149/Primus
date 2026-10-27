package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
public class product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private boolean isActive = true;

    // This creates the relationship between a Product and a Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private category category;
}