#pragma once

#include <Arduino.h>

namespace cone_device {

class UltrasonicArray {
public:
  UltrasonicArray(uint8_t trigPin, uint8_t echoPin);

  void begin();

  // 单次读取距离，单位 cm
  // 返回 -1 表示超时或无有效回波
  float readDistanceCmOnce();

  // 多次采样平均滤波
  // sampleCount 为 0 或没有有效回波时返回 -1
  float readDistanceCmFiltered(uint8_t sampleCount = 5);

private:
  uint8_t trigPin_;
  uint8_t echoPin_;

  static constexpr unsigned long kEchoTimeoutUs = 30000UL;
};

}  // namespace cone_device