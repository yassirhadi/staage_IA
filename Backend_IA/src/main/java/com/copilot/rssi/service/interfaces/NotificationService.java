package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.entity.Notification;

import java.util.List;

public interface NotificationService {
    
    List<Notification> getAllNotifications();
    
    List<Notification> getUserNotifications(Long userId);
    
    List<Notification> getUnreadNotifications();
    
    Long countUnreadNotifications();
    
    Notification markAsRead(Long id);
    
    Notification createNotification(Notification notification);
    
    void deleteNotification(Long id);
}
