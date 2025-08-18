package com.quadra.ecommerce_api.dto.custom.address;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.quadra.ecommerce_api.entity.address.District;

import java.util.List;

public class ProvinceResponse {
    private String name;
    private int code;
    @JsonProperty("division_type")
    private String divisionType;
    private String codename;
    @JsonProperty("phone_code")
    private int phoneCode;
    private List<District> districts;

    // Getters và setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getDivisionType() { return divisionType; }
    public void setDivisionType(String divisionType) { this.divisionType = divisionType; }
    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }
    public int getPhoneCode() { return phoneCode; }
    public void setPhoneCode(int phoneCode) { this.phoneCode = phoneCode; }
    public List<District> getDistricts() { return districts; }
    public void setDistricts(List<District> districts) { this.districts = districts; }
}