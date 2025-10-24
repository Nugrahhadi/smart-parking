"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create users table
    await queryInterface.createTable("users", {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING(100),
      },
      phone_number: {
        type: Sequelize.STRING(15),
      },
      role: {
        type: Sequelize.ENUM("user", "admin"),
        defaultValue: "user",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 2. Create parking_locations table
    await queryInterface.createTable("parking_locations", {
      location_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
      },
      total_spots: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      available_spots: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      image_url: {
        type: Sequelize.STRING(255),
      },
    });

    // 3. Create parking_spots table with zone_type ENUM
    await queryInterface.createTable("parking_spots", {
      spot_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "parking_locations",
          key: "location_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      spot_number: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "available",
          "occupied",
          "reserved",
          "maintenance"
        ),
        defaultValue: "available",
      },
      zone_type: {
        type: Sequelize.ENUM(
          "VIP Royal Zone",
          "Entertainment District",
          "Shopping Paradise",
          "Culinary Heaven",
          "Electric Vehicle Station",
          "Regular Parking"
        ),
        defaultValue: "Regular Parking",
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 5000.0,
      },
    });

    // 4. Create vehicles table
    await queryInterface.createTable("vehicles", {
      vehicle_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      vehicle_type: {
        type: Sequelize.STRING(50),
      },
      license_plate: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      brand: {
        type: Sequelize.STRING(50),
      },
      model: {
        type: Sequelize.STRING(50),
      },
      color: {
        type: Sequelize.STRING(30),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 5. Create reservations table
    await queryInterface.createTable("reservations", {
      reservation_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      spot_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "parking_spots",
          key: "spot_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "vehicles",
          key: "vehicle_id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "completed", "cancelled"),
        defaultValue: "active",
      },
      total_cost: {
        type: Sequelize.DECIMAL(10, 2),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 6. Create payments table
    await queryInterface.createTable("payments", {
      payment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      reservation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "reservations",
          key: "reservation_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.STRING(50),
      },
      payment_status: {
        type: Sequelize.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        unique: true,
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 7. Create notifications table
    await queryInterface.createTable("notifications", {
      notification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex("parking_spots", ["location_id"]);
    await queryInterface.addIndex("parking_spots", ["status"]);
    await queryInterface.addIndex("parking_spots", ["zone_type"]);
    await queryInterface.addIndex("vehicles", ["user_id"]);
    await queryInterface.addIndex("reservations", ["user_id"]);
    await queryInterface.addIndex("reservations", ["spot_id"]);
    await queryInterface.addIndex("reservations", ["status"]);
    await queryInterface.addIndex("payments", ["reservation_id"]);
    await queryInterface.addIndex("notifications", ["user_id"]);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable("notifications");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("reservations");
    await queryInterface.dropTable("vehicles");
    await queryInterface.dropTable("parking_spots");
    await queryInterface.dropTable("parking_locations");
    await queryInterface.dropTable("users");
  },
};
