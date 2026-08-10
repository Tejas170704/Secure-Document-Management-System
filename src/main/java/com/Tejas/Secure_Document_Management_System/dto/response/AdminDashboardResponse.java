package com.Tejas.Secure_Document_Management_System.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalDocuments;

    private long totalSharedDocuments;

    private long totalAuditLogs;

}