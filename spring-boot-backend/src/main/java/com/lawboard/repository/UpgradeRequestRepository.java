package com.lawboard.repository;

import com.lawboard.model.UpgradeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpgradeRequestRepository extends JpaRepository<UpgradeRequest, Long> {
    // Spring Data JPA automatically provides save(), findAll(), findById(), etc.
}
