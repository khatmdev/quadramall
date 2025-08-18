package com.quadra.ecommerce_api.entity.address;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Ward {
    private String name;
    private int code;
    @JsonProperty("division_type")
    private String divisionType;
    private String codename;
    @JsonProperty("district_code")
    private int districtCode;

    // Getters và setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getDivisionType() { return divisionType; }
    public void setDivisionType(String divisionType) { this.divisionType = divisionType; }
    public String getCodename() { return codename; }
    public void setCodename(String codename) { this.codename = codename; }
    public int getDistrictCode() { return districtCode; }
    public void setDistrictCode(int districtCode) { this.districtCode = districtCode; }
}