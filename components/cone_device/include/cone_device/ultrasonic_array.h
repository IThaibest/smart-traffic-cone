#pragma once

#include <array>
#include <cstdint>
#include <string>

namespace cone_device {

constexpr size_t kUltrasonicChannelCount = 4;

struct UltrasonicChannelConfig {
  int trigger_pin = -1;
  int echo_pin = -1;
  uint32_t timeout_us = 30000;
};

struct UltrasonicArrayConfig {
  std::array<UltrasonicChannelConfig, kUltrasonicChannelCount> channels = {};
  uint32_t sample_interval_ms = 100;
  uint32_t stale_after_ms = 1000;
};

struct UltrasonicChannelStatus {
  bool present = false;
  bool timed_out = false;
  float distance_m = 0.0f;
  uint32_t sample_age_ms = 0;
  std::string last_error;
};

struct UltrasonicArrayStatus {
  bool enabled = false;
  bool initialized = false;
  std::array<UltrasonicChannelStatus, kUltrasonicChannelCount> channels = {};
  std::string last_error;
};

bool setup_ultrasonic_array(const UltrasonicArrayConfig& config);
void tick_ultrasonic_array();
void deinit_ultrasonic_array();
UltrasonicArrayStatus ultrasonic_array_status();

}  // namespace cone_device
