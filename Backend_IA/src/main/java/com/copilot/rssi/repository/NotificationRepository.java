package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    Long countUnreadNotifications();
}
