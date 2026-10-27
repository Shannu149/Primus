package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private String phone;
    private String address;
    private String pinCode;
    
    private BigDecimal totalAmount;
    private String status = "PENDING";

    @Column(nullable = false, columnDefinition = "varchar(16) default 'ONCE'")
    private String orderType = "ONCE"; 

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<orderItem> items;
}