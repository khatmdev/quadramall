package com.quadra.ecommerce_api.controller.customer.wallet;

import com.quadra.ecommerce_api.dto.base.wallet.WalletDTO;
import com.quadra.ecommerce_api.dto.custom.wallet.response.TransactionHistory;
import com.quadra.ecommerce_api.dto.custom.wallet.response.WalletDashboardResponse;
import com.quadra.ecommerce_api.entity.user.User;
import com.quadra.ecommerce_api.entity.wallet.Wallet;
import com.quadra.ecommerce_api.exception.ExCustom;
import com.quadra.ecommerce_api.mapper.base.wallet.WalletMapper;
import com.quadra.ecommerce_api.service.wallet.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;
    private final WalletMapper walletMapper;

    @Autowired
    public WalletController(WalletService walletService,
                            WalletMapper walletMapper) {
        this.walletService = walletService;
        this.walletMapper = walletMapper;
    }

    @GetMapping
    public ResponseEntity<?> getWallet(@AuthenticationPrincipal User user) {
        Wallet wallet = walletService.getWalletByUser(user);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message","Ví không khả dụng"));
        }
        WalletDTO walletDTO = walletMapper.toDto(wallet);
        return   ResponseEntity.status(HttpStatus.OK).body(walletDTO);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getWalletDashboard(@AuthenticationPrincipal User user) {
        if(user == null) {
            throw new ExCustom(HttpStatus.UNAUTHORIZED,"Vui lòng đăng nhập để sử dụng.");
        }
        WalletDashboardResponse walletDashboardResponse = walletService.getWalletDashboard(user.getId());
        if(walletDashboardResponse == null) {
            throw new ExCustom(HttpStatus.BAD_REQUEST,"Không thể truy vấn giao dịch");
        }
        return ResponseEntity.status(HttpStatus.OK).body(walletDashboardResponse);
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionHistory>> getTransactionHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        if (user == null) {
            throw new ExCustom(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để sử dụng.");
        }

        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new ExCustom(HttpStatus.BAD_REQUEST, "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc .");
        }

        Page<TransactionHistory> transactions = walletService.getTransactionHistory(
                user.getId(), type, status, startDate, endDate, pageable);
        return ResponseEntity.ok(transactions);
    }




}
