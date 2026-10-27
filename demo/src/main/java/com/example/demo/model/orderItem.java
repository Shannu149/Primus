package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "order_items")
@Data
public class orderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private order order;

    // This references your lowercase product.java file!
    @ManyToOne
    @JoinColumn(name = "product_id")
    private product product; 

    private Integer quantity;
    private BigDecimal price;
}