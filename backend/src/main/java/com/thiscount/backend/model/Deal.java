package com.thiscount.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "deals")
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    // שדה חדש עבור נתיב התמונה המאובטח
    @Column(name = "image_path")
    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    public Deal() {}

    public Deal(String title, String description, User owner) {
        this.title = title;
        this.description = description;
        this.owner = owner;
    }

    // Getters קיימים
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public User getOwner() { return owner; }

    // Getter חדש עבור התמונה
    public String getImagePath() { return imagePath; }

    // Setters קיימים (עבור עדכון פונקציונליות)
    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    // Setter חדש עבור התמונה
    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
}