package com.example.demo.controller;

import com.example.demo.model.order;
import com.example.demo.repository.OrderRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepo;

    public OrderController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    // 1. The POST method for customers to place new orders
    @PostMapping
    public order placeOrder(@RequestBody order order) {
        
        if (order.getOrderType() == null) order.setOrderType("ONCE");
        if (!List.of("ONCE", "MONTHLY").contains(order.getOrderType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose ONCE or MONTHLY");
        }
        order.setId(null);
        order.setStatus("PENDING");
        // This links every grocery item inside the cart strictly to THIS specific order receipt
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        
        // Save the receipt and all items to MySQL instantly
        return orderRepo.save(order);
    }

    // 2. The GET method for you/your employees to view all incoming orders later!
    @GetMapping
    public List<order> getAllOrders() {
        return orderRepo.findAll();
    }
}