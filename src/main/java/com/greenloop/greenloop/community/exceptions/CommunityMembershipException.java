package com.greenloop.greenloop.community.exceptions;

public class CommunityMembershipException extends RuntimeException {
    public CommunityMembershipException(String message) {
        super(message);
    }

    public CommunityMembershipException(String message, Throwable cause) {
        super(message, cause);
    }
}
