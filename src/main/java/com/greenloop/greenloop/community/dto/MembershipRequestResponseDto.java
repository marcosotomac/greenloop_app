package com.greenloop.greenloop.community.dto;

import com.greenloop.greenloop.community.domain.CommunityMembershipRequest;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipRequestResponseDto {

    private Long id;
    private Long communityId;
    private String communityName;
    private Long userId;
    private String userName;
    private String userFirstName;
    private String userLastName;
    private String message;
    private CommunityMembershipRequest.RequestStatus status;
    private String createdAt;
    private String respondedAt;
    private String responseMessage;
}
