package com.quadra.ecommerce_api.entity.address;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class District {
    private String name;
    private int code;
    @JsonProperty("division_type")
    private String divisionType;
    private String codename;
    @JsonProperty("province_code")
    private int provinceCode;
    private List<Ward> wards;

    // Getters và setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getDivisionType() { return divisionType; }
    public void setDivisionType(String divisionType) { this.divisionType = divisionType; }
    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }
    public int getProvinceCode() { return provinceCode; }
    public void setProvinceCode(int provinceCode) { this.provinceCode = provinceCode; }
    public List<Ward> getWards() { return wards; }
    public void setWards(List<Ward> wards) { this.wards = wards; }
}