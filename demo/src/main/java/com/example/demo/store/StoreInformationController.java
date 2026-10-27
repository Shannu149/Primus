package com.example.demo.store;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/store-information")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class StoreInformationController {
    private final StoreInformationService store;
    public StoreInformationController(StoreInformationService store) { this.store = store; }
    @GetMapping public List<StoreKnowledge.Entry> read() { return store.read(); }
}
