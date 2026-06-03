#include "cone_device/telemetry_encoder.h"

#include <sstream>

namespace cone_device {
namespace {
const char* bool_json(bool value) {
  return value ? "true" : "false";
}
}  // namespace

std::string encode_telemetry_json(const TelemetrySnapshot& snapshot) {
  std::ostringstream out;
  out << "{";
  out << "\"cone_id\":\"" << snapshot.cone_id << "\",";
  out << "\"uptime_ms\":" << snapshot.uptime_ms << ",";
  out << "\"location\":{";
  out << "\"has_fix\":" << bool_json(snapshot.gps.has_fix) << ",";
  out << "\"longitude\":" << snapshot.gps.longitude << ",";
  out << "\"latitude\":" << snapshot.gps.latitude << ",";
  out << "\"accuracy_m\":" << snapshot.gps.accuracy_m << ",";
  out << "\"last_fix_age_ms\":" << snapshot.gps.last_fix_age_ms;
  out << "},";
  out << "\"ultrasonic\":{\"channels\":[";
  for (size_t i = 0; i < kUltrasonicChannelCount; ++i) {
    const auto& channel = snapshot.ultrasonic.channels[i];
    if (i > 0) {
      out << ",";
    }
    out << "{";
    out << "\"channel\":" << i << ",";
    out << "\"present\":" << bool_json(channel.present) << ",";
    out << "\"timed_out\":" << bool_json(channel.timed_out) << ",";
    out << "\"distance_m\":" << channel.distance_m << ",";
    out << "\"sample_age_ms\":" << channel.sample_age_ms;
    out << "}";
  }
  out << "]},";
  out << "\"camera\":{";
  out << "\"enabled\":" << bool_json(snapshot.camera.enabled) << ",";
  out << "\"initialized\":" << bool_json(snapshot.camera.initialized) << ",";
  out << "\"frame_available\":" << bool_json(snapshot.camera.frame_available) << ",";
  out << "\"last_frame_age_ms\":" << snapshot.camera.last_frame_age_ms << ",";
  out << "\"frame_count\":" << snapshot.camera.frame_count;
  out << "}";
  out << "}";
  return out.str();
}

}  // namespace cone_device
