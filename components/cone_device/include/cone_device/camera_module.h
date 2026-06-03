#pragma once

#include <cstdint>
#include <string>

namespace cone_device {

struct CameraModuleConfig {
  uint16_t frame_width = 640;
  uint16_t frame_height = 480;
  uint32_t capture_interval_ms = 1000;
};

struct CameraStatus {
  bool enabled = false;
  bool initialized = false;
  bool frame_available = false;
  uint32_t last_frame_age_ms = 0;
  uint32_t frame_count = 0;
  std::string last_error;
};

bool setup_camera(const CameraModuleConfig& config);
void tick_camera();
void deinit_camera();
CameraStatus camera_status();

}  // namespace cone_device
