package com.quadra.ecommerce_api.utils.payment;

import java.util.HashMap;
import java.util.Map;

public class ErrorMessageService {

    private static final Map<String, String> ERROR_MESSAGES = new HashMap<>();

    static {
        ERROR_MESSAGES.put("00", "Giao dịch thành công");
        ERROR_MESSAGES.put("07", "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).");
        ERROR_MESSAGES.put("09", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.");
        ERROR_MESSAGES.put("10", "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần");
        ERROR_MESSAGES.put("11", "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.");
        ERROR_MESSAGES.put("12", "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.");
        ERROR_MESSAGES.put("13", "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.");
        ERROR_MESSAGES.put("24", "Giao dịch không thành công do: Khách hàng hủy giao dịch");
        ERROR_MESSAGES.put("51", "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.");
        ERROR_MESSAGES.put("65", "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.");
        ERROR_MESSAGES.put("75", "Ngân hàng thanh toán đang bảo trì.");
        ERROR_MESSAGES.put("79", "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch");
    }

    /**
     * Trả về thông báo tương ứng với mã lỗi.
     *
     * @param errorCode Mã lỗi dưới dạng chuỗi.
     * @return Thông báo tương ứng với mã lỗi, hoặc "Mã lỗi không hợp lệ" nếu mã lỗi không tồn tại.
     */
    public static String getErrorMessage(String errorCode) {
        if (errorCode == null || errorCode.isEmpty()) {
            return "Mã lỗi không hợp lệ";
        }
        return ERROR_MESSAGES.getOrDefault(errorCode, "Mã lỗi không hợp lệ");
    }

}