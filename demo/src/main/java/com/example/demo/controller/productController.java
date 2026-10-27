package com.example.demo.controller;

import com.example.demo.model.product;
import com.example.demo.repository.productRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class productController {

    private final productRepository prodRepo;

    public productController(productRepository prodRepo) {
        this.prodRepo = prodRepo;
    }

    // Your existing GET method (Reads data)
    @GetMapping
    public List<product> getAllProducts() {
        return prodRepo.findAll();
    }

    // NEW POST method (Creates data
    @PostMapping
    public product createProduct(@RequestBody product product) {
        return prodRepo.save(product);
    }
}